import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { stripe, createOrGetCustomer, createPaymentIntent } from '@/lib/stripe';
import { calcServiceFee } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      listing_id,
      quantity,
      delivery_email,
      delivery_phone,
      save_card,
      payment_method_id,
    } = await request.json();

    const supabase = createSupabaseFromRequest(request);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get listing info
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        events (id, name, venue, date, image_url)
      `)
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Calculate pricing
    const subtotal = listing.price * quantity;
    const serviceFee = calcServiceFee(subtotal);
    let total = subtotal + serviceFee;

    // Apply credit balance if user has any
    let creditUsed = 0;
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('id', user.id)
      .single();

    const creditBal = Number(buyerProfile?.credit_balance) || 0;
    if (creditBal > 0) {
      creditUsed = Math.min(creditBal, total);
      total = Math.round((total - creditUsed) * 100) / 100;
    }

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json({ error: 'Failed to generate order number' }, { status: 500 });
    }

    // Create order with pending status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumberData,
        listing_id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        event_id: listing.event_id,
        ticket_quantity: quantity,
        ticket_type: listing.ticket_type,
        price_per_ticket: listing.price,
        service_fee: serviceFee,
        total_amount: total,
        delivery_email,
        delivery_phone,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    let customerId: string | undefined;

    if (save_card || payment_method_id) {
      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      customerId = await createOrGetCustomer(user.id, profile?.email);

      // If using saved card, attach the payment method to customer
      if (payment_method_id) {
        await stripe.paymentMethods.attach(payment_method_id, {
          customer: customerId,
        });
      }
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: total,
      customerId,
      paymentMethodId: payment_method_id,
      orderId: order.id.toString(),
    });

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    // Deduct credit used
    if (creditUsed > 0) {
      await supabase
        .from('profiles')
        .update({ credit_balance: creditBal - creditUsed })
        .eq('id', user.id);
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      order_id: order.id,
      credit_used: creditUsed,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}