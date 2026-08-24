import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingCard from "@/components/ListingCard";
import type { Listing, Profile } from "@/types/database";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*, owner:profiles(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="card-grid-pattern absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-ink-200 bg-paper px-3 py-1 text-xs font-bold text-ink-600">
              منصة تكوين الفرق للطلاب والمطورين
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              كوّن فريقك. شارك في مشروعك.
            </h1>
            <p className="mt-4 text-lg text-ink-600">
              لا تخلي نقص الأعضاء يوقف فكرتك.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/explore?looking_for=team"
                className="w-full rounded-full bg-spark px-6 py-3 text-center font-bold text-paper shadow-card hover:bg-spark-600 transition-colors sm:w-auto"
              >
                أبحث عن فريق
              </Link>
              <Link
                href="/explore?looking_for=members"
                className="w-full rounded-full bg-ink px-6 py-3 text-center font-bold text-paper shadow-card hover:bg-ink-800 transition-colors sm:w-auto"
              >
                أبحث عن أعضاء
              </Link>
            </div>
          </div>

          {/* Signature element: two role nodes joined by a dashed trace,
              visualizing two sides "forming" a connection. */}
          <div className="mx-auto mt-16 flex max-w-md items-center justify-center gap-6" aria-hidden="true">
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-ink-200 bg-paper text-center shadow-card">
              <span className="text-xl">🧩</span>
              <span className="mt-1 text-[10px] font-bold text-ink-600">فكرة</span>
            </div>
            <div className="h-px flex-1 bg-[repeating-linear-gradient(to_left,#C3C5D6_0,#C3C5D6_6px,transparent_6px,transparent_12px)]" />
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-spark bg-spark-50 text-center shadow-card">
              <span className="text-2xl">🤝</span>
              <span className="mt-1 text-[10px] font-bold text-spark-700">تكوين</span>
            </div>
            <div className="h-px flex-1 bg-[repeating-linear-gradient(to_left,#C3C5D6_0,#C3C5D6_6px,transparent_6px,transparent_12px)]" />
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-ink-200 bg-paper text-center shadow-card">
              <span className="text-xl">🚀</span>
              <span className="mt-1 text-[10px] font-bold text-ink-600">إطلاق</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-ink-100 bg-ink-50/40 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
            كيف تعمل المنصة؟
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "انشر أو تصفّح",
                desc: "أنشئ فرصة تبحث فيها عن أعضاء، أو تصفّح الفرص المتاحة إن كنت تبحث عن فريق.",
              },
              {
                n: "02",
                title: "أرسل طلب انضمام",
                desc: "وجدت فرصة تناسبك؟ أرسل رسالة قصيرة تعرّف فيها بنفسك ومهاراتك.",
              },
              {
                n: "03",
                title: "تواصل وابدأ",
                desc: "عند قبول الطلب، تظهر وسيلة التواصل لكلا الطرفين لتبدأوا العمل معًا.",
              },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-ink-100 bg-paper p-6 shadow-card">
                <span className="font-display text-3xl font-extrabold text-ink-200">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open opportunities preview */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">فرص منشورة حديثًا</h2>
            <Link href="/explore" className="text-sm font-bold text-spark hover:text-spark-600">
              عرض الكل ←
            </Link>
          </div>

          {listings && listings.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing: Listing & { owner: Profile }) => (
                <ListingCard key={listing.id} listing={listing} owner={listing.owner} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-400">
              لا توجد فرص منشورة بعد. كن أول من ينشر فرصة!
            </div>
          )}
        </div>
      </section>
    </>
  );
}
