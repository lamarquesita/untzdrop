"use client";

import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const ELEMENT_STYLE = {
  base: {
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "inherit",
    "::placeholder": {
      color: "#555555",
    },
  },
  invalid: {
    color: "#ef4444",
  },
};

const ELEMENT_OPTIONS = {
  style: ELEMENT_STYLE,
};

interface StripeCardFormProps {
  onReady: (ready: boolean) => void;
}

export default function StripeCardForm({ onReady }: StripeCardFormProps) {
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  const updateReady = (card: boolean, expiry: boolean, cvc: boolean) => {
    onReady(card && expiry && cvc);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Número de tarjeta</label>
        <div className="w-full bg-[#111111] border border-[#333] px-4 py-3.5 text-sm">
          <CardNumberElement
            options={ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              updateReady(e.complete, expiryComplete, cvcComplete);
            }}
          />
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">Vencimiento</label>
          <div className="w-full bg-[#111111] border border-[#333] px-4 py-3.5 text-sm">
            <CardExpiryElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => {
                setExpiryComplete(e.complete);
                updateReady(cardComplete, e.complete, cvcComplete);
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">CVC</label>
          <div className="w-full bg-[#111111] border border-[#333] px-4 py-3.5 text-sm">
            <CardCvcElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => {
                setCvcComplete(e.complete);
                updateReady(cardComplete, expiryComplete, e.complete);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to get stripe + elements for payment confirmation
export function useStripePayment() {
  const stripe = useStripe();
  const elements = useElements();

  const confirmPayment = async (clientSecret: string) => {
    if (!stripe || !elements) {
      throw new Error("Stripe not loaded");
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      throw new Error("Card element not found");
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      throw new Error(error.message || "Payment failed");
    }

    return paymentIntent;
  };

  const confirmWithApplePay = async (
    clientSecret: string,
    { total, label }: { total: number; label: string }
  ) => {
    if (!stripe) {
      throw new Error("Stripe not loaded");
    }

    const paymentRequest = stripe.paymentRequest({
      country: "PE",
      currency: "pen",
      total: { label, amount: total },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();
    if (!canMakePayment) {
      throw new Error("Apple Pay no está disponible en este dispositivo");
    }

    return new Promise<ReturnType<typeof stripe.confirmCardPayment> extends Promise<infer R> ? R extends { paymentIntent?: infer PI } ? PI : never : never>((resolve, reject) => {
      paymentRequest.on("paymentmethod", async (ev) => {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete("fail");
          reject(new Error(confirmError.message || "Payment failed"));
          return;
        }

        ev.complete("success");

        if (paymentIntent?.status === "requires_action") {
          const { error, paymentIntent: pi } = await stripe.confirmCardPayment(clientSecret);
          if (error) {
            reject(new Error(error.message || "Payment failed"));
          } else {
            resolve(pi);
          }
        } else {
          resolve(paymentIntent);
        }
      });

      paymentRequest.show();
    });
  };

  return { confirmPayment, confirmWithApplePay, ready: !!stripe && !!elements };
}
