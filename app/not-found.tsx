import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-display text-5xl font-extrabold text-ink-200">٤٠٤</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">لم نجد هذه الصفحة</h1>
      <p className="mt-2 text-sm text-ink-400">
        ربما تم حذف الفرصة أو الرابط غير صحيح.
      </p>
      <Link href="/explore" className="btn-primary mt-6 inline-block">
        استكشف الفرص
      </Link>
    </div>
  );
}
