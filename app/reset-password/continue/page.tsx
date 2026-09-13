"use client";

import { useSearchParams } from "next/navigation";

export default function ResetPasswordContinuePage() {
  const searchParams = useSearchParams();
  const confirmationUrl = searchParams.get("confirmation_url");

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        إعادة تعيين كلمة المرور
      </h1>

      <p className="mt-2 text-center text-sm text-ink-400">
        اضغط على الزر أدناه للمتابعة واختيار كلمة مرور جديدة.
      </p>

      {confirmationUrl ? (
        <a
          href={confirmationUrl}
          className="mt-8 block w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-white"
        >
          متابعة إعادة تعيين كلمة المرور
        </a>
      ) : (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          رابط إعادة تعيين كلم المرور غير صالح.
        </p>
      )}
    </div>
  );
}