import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center sm:flex-row sm:justify-between sm:text-right">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-paper text-xs font-display font-bold">
            ت
          </span>
          <span className="font-display text-sm font-bold text-ink">تكوين</span>
        </div>
        <p className="text-xs text-ink-400">
          كوّن فريقك، شارك في مشروعك. لا تخلي نقص الأعضاء يوقف فكرتك.
        </p>
        <Link href="/explore" className="text-xs font-medium text-ink-600 hover:text-ink">
          استكشف الفرص المتاحة
        </Link>
      </div>
    </footer>
  );
}
