"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("يرجى إكمال التحقق من أنك لست روبوتًا.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      }
    );

    if (resetError) {
      setError("تعذّر إرسال رابط إعادة تعيين كلمة المرور. حاول مرة أخرى.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">
          تحقق من بريدك الإلكتروني
        </h1>

        <p className="mt-3 text-ink-400">
          أرسلنا رابطًا لإعادة تعيين كلمة المرور إلى {email}.
        </p>

        <p className="mt-2 text-sm text-ink-400">
          إذا لم تجد الرسالة، تحقق من مجلد البريد العشوائي.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block font-bold text-spark hover:text-spark-600"
        >
          العودة لتسجيل الدخول ←
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        استعادة كلمة المرور
      </h1>

      <p className="mt-2 text-center text-sm text-ink-400">
        أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink-600">
            البريد الإلكتروني
          </span>

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </label>

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        تذكرت كلمة المرور؟{" "}
        <Link
          href="/login"
          className="font-bold text-spark hover:text-spark-600"
        >
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}