"use client";

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { ReactNode } from 'react';

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const stripe = getStripe();

  // If Stripe isn't configured yet, render children without the provider
  if (!stripe) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  );
}
