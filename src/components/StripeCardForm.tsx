"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";

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

export interface StripeCardFormRef {
  getLast4: () => Promise<string>;
}

const StripeCardForm = forwardRef<StripeCardFormRef, StripeCardFormProps>(function StripeCardForm({ onReady }, ref) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  const updateReady = (card: boolean, expiry: boolean, cvc: boolean) => {
    onReady(card && expiry && cvc);
  };

  useImperativeHandle(ref, () => ({
    getLast4: async () => {
      if (!stripe || !elements) return "";
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) return "";
      try {
        const { token } = await stripe.createToken(cardElement);
        return token?.card?.last4 || "";
      } catch {
        return "";
      }
    },
  }));

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
});

export default StripeCardForm;

// Hook to get stripe + elements for payment confirmation
export function useStripePayment(applePayConfig?: { total: number; label: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const paymentRequestRef = useRef<PaymentRequest | null>(null);
  const applePayHandlersRef = useRef<{
    resolve: (pi: import("@stripe/stripe-js").PaymentIntent | undefined) => void;
    reject: (err: Error) => void;
    getClientSecret: () => Promise<string>;
  } | null>(null);

  // Pre-create PaymentRequest and check canMakePayment on mount
  useEffect(() => {
    if (!stripe || !applePayConfig) return;

    const pr = stripe.paymentRequest({
      country: "PE",
      currency: "pen",
      total: { label: applePayConfig.label, amount: applePayConfig.total },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result?.applePay) {
        setApplePayAvailable(true);
        paymentRequestRef.current = pr;

        pr.on("paymentmethod", async (ev) => {
          const handlers = applePayHandlersRef.current;
          if (!handlers) {
            ev.complete("fail");
            return;
          }

          try {
            const clientSecret = await handlers.getClientSecret();

            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              ev.complete("fail");
              handlers.reject(new Error(confirmError.message || "Payment failed"));
              return;
            }

            ev.complete("success");

            if (paymentIntent?.status === "requires_action") {
              const { error, paymentIntent: pi } = await stripe.confirmCardPayment(clientSecret);
              if (error) {
                handlers.reject(new Error(error.message || "Payment failed"));
              } else {
                handlers.resolve(pi);
              }
            } else {
              handlers.resolve(paymentIntent);
            }
          } catch (err) {
            ev.complete("fail");
            handlers.reject(err instanceof Error ? err : new Error("Payment failed"));
          }
        });

        pr.on("cancel", () => {
          applePayHandlersRef.current?.reject(new Error("Pago cancelado"));
        });
      }
    });
  }, [stripe, applePayConfig?.total, applePayConfig?.label]);

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

  // Apple Pay: show() is called synchronously — PaymentRequest was pre-created in useEffect.
  const confirmWithApplePay = (
    getClientSecret: () => Promise<string>
  ): Promise<import("@stripe/stripe-js").PaymentIntent | undefined> => {
    const pr = paymentRequestRef.current;
    if (!pr) {
      return Promise.reject(new Error("Apple Pay no está disponible"));
    }

    return new Promise((resolve, reject) => {
      applePayHandlersRef.current = { resolve, reject, getClientSecret };
      // show() called synchronously from user gesture — no awaits before this
      pr.show();
    });
  };

  return { confirmPayment, confirmWithApplePay, applePayAvailable, ready: !!stripe && !!elements };
}
