import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseFromRequest(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders with event info via joins
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        events ( id, name, date, venue, image_url )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Shape data to match frontend Order type
    const shaped = (orders ?? []).map((o: any) => ({
      id: String(o.id),
      orderNumber: o.order_number,
      event: {
        id: o.events?.id ?? o.event_id,
        name: o.events?.name ?? '',
        date: o.events?.date ?? '',
        venue: o.events?.venue ?? '',
        address: '',
        image_url: o.events?.image_url ?? null,
      },
      ticketQuantity: o.ticket_quantity,
      ticketType: o.ticket_type as "ga" | "vip",
      pricePerTicket: Number(o.price_per_ticket),
      amountPaid: Number(o.total_amount),
      datePurchased: o.created_at,
      status: mapOrderStatus(o.status),
      isUpcoming: o.events?.date ? new Date(o.events.date) > new Date() : false,
      delivery: {
        method: 'Transferencia Digital',
        email: o.delivery_email ?? '',
        phone: o.delivery_phone ?? '',
      },
      payment: {
        cardLast4: o.card_last4 ?? '****',
        cardBrand: o.card_brand ?? 'Card',
        cardholderName: '',
        subtotal: Number(o.price_per_ticket) * o.ticket_quantity,
        serviceFee: Number(o.service_fee),
        total: Number(o.total_amount),
        paidAt: o.updated_at ?? o.created_at,
      },
      qrCode: `CVTICKET-${o.order_number}`,
    }));

    return NextResponse.json({ orders: shaped });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapOrderStatus(status: string): "confirmed" | "pending" | "cancelled" | "completed" {
  switch (status) {
    case 'paid':
    case 'delivered':
      return 'confirmed';
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'refunded':
      return 'cancelled';
    default:
      return 'pending';
  }
}
