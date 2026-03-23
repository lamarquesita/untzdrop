import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

// Use service role client for storage operations

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

    // Create listing first to get listing ID
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        event_id: parseInt(eventId),
        price,
        quantity,
        ticket_type: ticketType,
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