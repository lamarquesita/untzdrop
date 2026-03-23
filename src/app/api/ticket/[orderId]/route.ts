import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest, supabaseAdmin } from '@/lib/supabase-server';

// Use service role client for storage operations

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = createSupabaseFromRequest(request);
    const { orderId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get order details with listing info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        listings (ticket_file_path)
      `)
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order is delivered or completed
    if (!['delivered', 'completed'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Ticket not available yet' },
        { status: 403 }
      );
    }

    if (!order.listings?.ticket_file_path) {
      return NextResponse.json(
        { error: 'Ticket file not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for the ticket file
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('ticket-files')
      .createSignedUrl(order.listings.ticket_file_path, 3600); // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ downloadUrl: signedUrlData.signedUrl });

  } catch (error) {
    console.error('Ticket API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}