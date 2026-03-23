import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseFromRequest } from '@/lib/supabase-server';
import { stripe, createOrGetCustomer } from '@/lib/stripe';
import { calcServiceFee } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      event_id,
      ticket_type,
      price_per_ticket,
      quantity,
    } = await request.json();

    const supabase = createSupabaseFromRequest(request);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate total amount
    const subtotal = price_per_ticket * quantity;
    const serviceFee = calcServiceFee(subtotal);
    const total = subtotal + serviceFee;

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Create or get customer
    const customerId = await createOrGetCustomer(user.id, profile?.email);

    // Create payment intent with auth hold
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to centavos
      currency: 'pen',
      customer: customerId,
      capture_method: 'manual', // Authorization hold
      metadata: {
        type: 'offer',
        user_id: user.id,
        event_id: event_id.toString(),
      },
    });

    // Create offer record
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .insert({
        event_id,
        buyer_id: user.id,
        ticket_type,
        price_per_ticket,
        quantity,
        stripe_payment_intent_id: paymentIntent.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (offerError) {
      console.error('Error creating offer:', offerError);
      // Cancel the payment intent if offer creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      offer_id: offer.id,
    });

  } catch (error) {
    console.error('Offers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}