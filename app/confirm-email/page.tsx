"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function confirmEmail() {
      const tokenHash = searchParams.get("token_hash");

      if (!tokenHash) {
        setStatus("error");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "signup",
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("success");
    }

    confirmEmail();
  }, [searchParams, supabase]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-ink-400">جارٍ تأكيد بريدك الإلكتروني...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">
          تعذر تأكيد البريد
        </h1>
        <p className="mt-3 text-ink-400">
          قد يكون رابط التأكيد غير صالح أو منتهي الصلاحية.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">
        تم تأكيد بريدك بنجاح ✓
      </h1>

      <p className="mt-3 text-ink-400">
        بقي تسجيل الدخول لإكمال رحلتك في تكوين.
      </p>

      <Link
  href={`/login?next=${encodeURIComponent(
    searchParams.get("next") || "/dashboard"
  )}`}
  className="btn-primary mt-6 inline-block"
>
        تسجيل الدخول والمتابعة
      </Link>
    </div>
  );
}