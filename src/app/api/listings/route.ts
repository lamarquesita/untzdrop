import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';
import { sendListingConfirmationEmail } from '@/lib/email';
import sharp from 'sharp';
import jsQR from 'jsqr';
import crypto from 'crypto';

// Use service role client for storage operations

async function extractQRHash(file: File): Promise<string | null> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Convert to raw RGBA pixel data with sharp
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // jsQR needs Uint8ClampedArray
    const clampedArray = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
    const code = jsQR(clampedArray, info.width, info.height);
    if (!code?.data) return null;

    // Hash the QR content
    return crypto.createHash('sha256').update(code.data).digest('hex');
  } catch (err) {
    console.error('Error extracting QR:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const eventId = formData.get('event_id') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const ticketType = formData.get('ticket_type') as string || 'ga';
    const ticketFile = formData.get('ticket_file') as File;

    // Validate required fields
    if (!eventId || !price || !quantity || !ticketFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract and hash the QR code from the uploaded image
    const qrHash = await extractQRHash(ticketFile);
    if (!qrHash) {
      return NextResponse.json(
        { error: 'No se pudo leer el código QR de la imagen. Asegúrate de que la imagen sea clara y contenga un QR válido.' },
        { status: 400 }
      );
    }

    // Check for duplicate QR — same hash already listed (active)
    const { data: existingListing } = await supabaseAdmin
      .from('listings')
      .select('id, status')
      .eq('qr_hash', qrHash)
      .in('status', ['active', 'sold'])
      .maybeSingle();

    if (existingListing) {
      return NextResponse.json(
        { error: 'Esta entrada ya fue publicada anteriormente. No se permiten entradas duplicadas en la plataforma.' },
        { status: 409 }
      );
    }

    // Create listing first to get listing ID
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        event_id: parseInt(eventId),
        price,
        quantity,
        ticket_type: ticketType,
        qr_hash: qrHash,
      })
      .select()
      .single();

    if (listingError || !listing) {
      console.error('Error creating listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    try {
      // Upload ticket file to storage
      const fileName = `${Date.now()}_${ticketFile.name}`;
      const filePath = `${user.id}/${listing.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('ticket-files')
        .upload(filePath, ticketFile, {
          contentType: ticketFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Delete the listing if file upload fails
        await supabase.from('listings').delete().eq('id', listing.id);
        return NextResponse.json(
          { error: 'Failed to upload ticket file' },
          { status: 500 }
        );
      }

      // Update listing with file path
      const { error: updateError } = await supabase
        .from('listings')
        .update({ ticket_file_path: uploadData.path })
        .eq('id', listing.id);

      if (updateError) {
        console.error('Error updating listing with file path:', updateError);
        // Clean up uploaded file
        await supabaseAdmin.storage.from('ticket-files').remove([uploadData.path]);
        // Delete the listing
        await supabase.from('listings').delete().eq('id', listing.id);
        return NextResponse.json(
          { error: 'Failed to update listing' },
          { status: 500 }
        );
      }

      // Send listing confirmation email (fire and forget)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        const { data: event } = await supabase
          .from('events')
          .select('name, date, venue, image_url')
          .eq('id', parseInt(eventId))
          .single();

        if (profile?.email && event) {
          sendListingConfirmationEmail({
            to: profile.email,
            listingId: listing.id,
            eventId: parseInt(eventId),
            eventName: event.name,
            eventDate: event.date,
            venue: event.venue,
            ticketType,
            quantity,
            price,
            eventImageUrl: event.image_url,
          }).catch(() => {});
        }
      } catch {}

      return NextResponse.json({ listing: { ...listing, ticket_file_path: uploadData.path } });

    } catch (error) {
      console.error('Error in file upload process:', error);
      // Delete the listing if anything fails
      await supabase.from('listings').delete().eq('id', listing.id);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}