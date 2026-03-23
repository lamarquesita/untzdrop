"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.code as string;
    if (code) {
      // Save referral code in localStorage (persists across sessions)
      localStorage.setItem("untzdrop_referral", code.toUpperCase());
    }
    router.replace("/");
  }, [params.code, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⚡</div>
        <p className="text-white text-sm">Redirigiendo...</p>
      </div>
    </div>
  );
}
