"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordContinuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const tokenHash = searchParams.get("token_hash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!tokenHash) {
      setError("رابط إعادة تعيين كلمة المرور غير صالح.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (verifyError) {
      setError("رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.");
      setLoading(false);
      return;
    }

    router.push("/reset-password");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        إعادة تعيين كلمة المرور
      </h1>

      <p className="mt-2 text-center text-sm text-ink-400">
        اضغط على الزر أدناه للمتابعة واختيار كلمة مرور جديدة.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading || !tokenHash}
        className="mt-8 w-full rounded-lg bg-ink px-4 py-3 text-center font-bold text-white disabled:opacity-50"
      >
        {loading ? "جاري التحقق..." : "متابعة إعادة تعيين كلمة المرور"}
      </button>
    </div>
  );
}