import Stripe from 'stripe';
import { supabaseAdmin } from './supabase-server';

// Stripe is only initialized when STRIPE_SECRET_KEY is available (runtime, not build time)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Helper function to create or get customer
export async function createOrGetCustomer(userId: string, email?: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: email || profile?.email || undefined,
    metadata: {
      user_id: userId,
    },
  });

  // Update profile with customer ID
  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

// Helper to create payment intent
export async function createPaymentIntent({
  amount,
  customerId,
  paymentMethodId,
  orderId,
}: {
  amount: number;
  customerId?: string;
  paymentMethodId?: string;
  orderId: string;
}) {
  const paymentIntentData: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(amount * 100), // Convert to centavos
    currency: 'pen',
    metadata: {
      order_id: orderId,
    },
  };

  if (customerId) {
    paymentIntentData.customer = customerId;
  }

  if (paymentMethodId) {
    paymentIntentData.payment_method = paymentMethodId;
    paymentIntentData.confirm = true;
    paymentIntentData.return_url = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`;
  }

  return await stripe.paymentIntents.create(paymentIntentData);
}