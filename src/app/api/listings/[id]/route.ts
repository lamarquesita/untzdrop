import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { id } = await params;
    const { price } = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, seller_id')
      .eq('id', id)
      .single();

    if (!listing || listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (!price || Number(price) <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('listings')
      .update({ price: Number(price) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, seller_id, ticket_file_path')
      .eq('id', id)
      .single();

    if (!listing || listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Delete the ticket file from storage
    if (listing.ticket_file_path) {
      await supabaseAdmin.storage.from('ticket-files').remove([listing.ticket_file_path]);
    }

    // Delete the listing
    await supabaseAdmin.from('listings').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
