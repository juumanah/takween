"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [major, setMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (!captchaToken) {
      setError("يرجى إكمال التحقق من أنك لست روبوتًا.");
      return;
}

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
     email,
     password,
     options: {
    data: { full_name: fullName },
    captchaToken,
  },
});

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    // If a session came back, email confirmation is off — finish the profile now.
    if (data.session && data.user) {
      await supabase.from("profiles").update({ major }).eq("id", data.user.id);
      router.push("/explore");
      router.refresh();
      return;
    }

    setNeedsConfirmation(true);
    setLoading(false);
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">تحقق من بريدك الإلكتروني</h1>
        <p className="mt-3 text-ink-400">
          أرسلنا رابط تأكيد إلى {email}. بعد التأكيد يمكنك تسجيل الدخول مباشرة.
        </p>
        <Link href="/login" className="mt-6 inline-block font-bold text-spark hover:text-spark-600">
          الذهاب لتسجيل الدخول ←
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-ink">أنشئ حسابك في تكوين</h1>
      <p className="mt-2 text-center text-sm text-ink-400">
        خطوة واحدة تفصلك عن إيجاد فريقك القادم.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="الاسم الكامل">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="مثال: سارة العتيبي"
          />
        </Field>

        <Field label="البريد الإلكتروني">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="كلمة المرور">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="6 أحرف على الأقل"
          />
        </Field>

        <Field label="التخصص (اختياري)">
          <input
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="input"
            placeholder="مثال: هندسة برمجيات"
          />
        </Field>
        <Turnstile
         siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
         onSuccess={(token) => setCaptchaToken(token)}
         onExpire={() => setCaptchaToken(null)}
/>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-spark hover:text-spark-600">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-600">{label}</span>
      {children}
    </label>
  );
}

function translateAuthError(message: string) {
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "هذا البريد الإلكتروني مسجّل مسبقًا.";
  }
  if (message.includes("Invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  return "حدث خطأ ما. حاول مرة أخرى.";
}
