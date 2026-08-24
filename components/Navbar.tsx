import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-spark text-paper font-display font-bold">
            ت
          </span>
          <span className="font-display text-lg font-bold text-ink">تكوين</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/explore" className="text-sm font-medium text-ink-600 hover:text-ink transition-colors">
            استكشف الفرص
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm font-medium text-ink-600 hover:text-ink transition-colors">
              لوحتي
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/listings/new"
                className="hidden rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper hover:bg-ink-800 transition-colors sm:block"
              >
                + انشر فرصة
              </Link>
              <Link href="/profile/edit" className="text-sm font-medium text-ink-600 hover:text-ink transition-colors">
                حسابي
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-ink transition-colors">
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-spark px-4 py-2 text-sm font-bold text-paper hover:bg-spark-600 transition-colors"
              >
                ابدأ الآن
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
