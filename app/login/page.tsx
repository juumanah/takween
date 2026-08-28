"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log("LOGIN ERROR:", signInError);
  setError(signInError.message);
  setLoading(false);
  return;
    }

    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-ink">مرحبًا بعودتك</h1>
      <p className="mt-2 text-center text-sm text-ink-400">سجّل الدخول لمتابعة رحلتك في تكوين.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink-600">البريد الإلكتروني</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink-600">كلمة المرور</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="font-bold text-spark hover:text-spark-600">
          أنشئ حسابًا
        </Link>
      </p>
    </div>
  );
}
