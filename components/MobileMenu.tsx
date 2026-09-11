"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="فتح القائمة"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-ink-50"
      >
        <span className="text-2xl leading-none">☰</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-ink-100 bg-paper px-5 py-4 shadow-sm">
          <nav className="flex flex-col gap-3">
            <Link
              href="/explore"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              استكشف الفرص
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              لوحتي
            </Link>

            <Link
              href="/listings/new"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-ink hover:bg-ink-50"
            >
              + انشر فرصة
            </Link>

            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              حسابي
            </Link>

            <div className="border-t border-ink-100 pt-3">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}