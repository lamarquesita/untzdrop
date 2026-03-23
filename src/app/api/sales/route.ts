import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders where this user is the seller
    const { data: sales, error: salesError } = await supabase
      .from('orders')
      .select(`
        *,
        events ( id, name, date, venue, image_url ),
        buyer:profiles!orders_buyer_id_fkey ( full_name, email )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales:', salesError);
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }

    // Shape data to match frontend Sale type
    const shaped = (sales ?? []).map((s: any) => {
      const salePrice = Number(s.price_per_ticket) * s.ticket_quantity;
      const platformFee = Number(s.service_fee);
      const processingFee = Math.round(salePrice * 0.029 + 0.30); // ~Stripe fee estimate
      const netEarnings = salePrice - platformFee - processingFee;

      return {
        id: String(s.id),
        orderNumber: s.order_number,
        event: {
          id: s.events?.id ?? s.event_id,
          name: s.events?.name ?? '',
          date: s.events?.date ?? '',
          venue: s.events?.venue ?? '',
          address: '',
          image_url: s.events?.image_url ?? null,
        },
        ticketQuantity: s.ticket_quantity,
        ticketType: s.ticket_type as "ga" | "vip",
        pricePerTicket: Number(s.price_per_ticket),
        totalPayout: netEarnings,
        datePlaced: s.created_at,
        status: mapSaleStatus(s.status),
        delivery: {
          buyerEmail: s.delivery_email ?? s.buyer?.email ?? '',
          transferredAt: ['delivered', 'completed'].includes(s.status) ? s.updated_at : null,
        },
        earnings: {
          salePrice,
          platformFee,
          processingFee,
          netEarnings,
        },
        payout: {
          status: s.status === 'completed' ? 'paid' as const :
                  s.status === 'delivered' ? 'processing' as const : 'pending' as const,
          method: s.status === 'completed' ? 'Transferencia Bancaria' : null,
          paidAt: s.status === 'completed' ? s.updated_at : null,
        },
      };
    });

    return NextResponse.json({ sales: shaped });

  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapSaleStatus(status: string): "completed" | "pending" | "transferred" | "cancelled" {
  switch (status) {
    case 'delivered':
      return 'transferred';
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'refunded':
      return 'cancelled';
    default:
      return 'pending';
  }
}
