"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">حدث خطأ غير متوقع</h1>
      <p className="mt-2 text-sm text-ink-400">{error.message || "حاول مرة أخرى بعد قليل."}</p>
      <button onClick={reset} className="btn-primary mt-6">
        إعادة المحاولة
      </button>
    </div>
  );
}
