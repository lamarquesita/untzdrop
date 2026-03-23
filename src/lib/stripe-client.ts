import { loadStripe } from '@stripe/stripe-js';

let stripePromise: ReturnType<typeof loadStripe>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      // Return null during build / when key isn't configured yet
      return null;
    }
    stripePromise = loadStripe(key);
  }

  return stripePromise;
};

// Helper function to confirm card payment
export async function confirmCardPayment(clientSecret: string) {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  return await stripe.confirmCardPayment(clientSecret);
}