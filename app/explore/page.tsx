import { createClient } from "@/lib/supabase/server";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import { LISTING_TYPE_LABELS_AR, MODE_LABELS_AR, type Listing, type Profile } from "@/types/database";


export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createClient();

  const q = searchParams.q?.trim() || "";
  const type = searchParams.type || "";
  const mode = searchParams.mode || "";
  const looking_for = searchParams.looking_for || "";
  const location = searchParams.location?.trim() || "";

  let query = supabase
    .from("listings")
    .select("*, owner:profiles(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (mode) query = query.eq("mode", mode);
  if (looking_for) query = query.eq("looking_for", looking_for);
  if (location) query = query.ilike("location", `%${location}%`);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data: listings } = await query;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">استكشف الفرص</h1>
        <p className="mt-2 text-sm text-ink-400">تصفّح كل الفرص المفتوحة حاليًا، أو ضيّق البحث بالفلاتر.</p>
      </div>

     <form method="GET" className="rounded-2xl border border-spark/15 bg-spark/5 p-2.5">
  <input
    type="search"
    name="q"
    defaultValue={q}
    placeholder="ابحث بالعنوان أو الوصف..."
    className="input w-full"
  />

  <details className="group mt-2">
    <summary className="mr-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink sm:hidden">
  الفلاتر
  <span className="text-xs transition-transform group-open:rotate-180">⌄</span>
</summary>

    <div className="mt-3 hidden grid-cols-2 gap-3 group-open:grid sm:grid sm:grid-cols-4">
      <select name="looking_for" defaultValue={looking_for} className="select">
        <option value="">كل الأنواع</option>
        <option value="members">يبحث عن أعضاء</option>
        <option value="team">يبحث عن فريق</option>
      </select>

      <select name="type" defaultValue={type} className="select">
        <option value="">كل التصنيفات</option>
        {Object.entries(LISTING_TYPE_LABELS_AR).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select name="mode" defaultValue={mode} className="select">
        <option value="">أونلاين وحضوري</option>
        {Object.entries(MODE_LABELS_AR).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <input
        name="location"
        defaultValue={location}
        placeholder="الموقع"
        className="input"
      />

      <button
        type="submit"
        className="btn-primary col-span-2 sm:col-span-1"
      >
        تطبيق الفلاتر
      </button>

      {(q || type || mode || looking_for || location) && (
        <a
          href="/explore"
          className="btn-secondary col-span-2 text-center sm:col-span-1"
        >
          مسح الفلاتر
        </a>
      )}
    </div>
  </details>
</form>

   {listings && listings.length > 0 ? (
  <>
    <div className="flex items-center gap-2">
  <h2 className="font-display text-lg font-bold text-ink">
    الفرص المتاحة
  </h2>

  <span className="inline-flex items-center justify-center rounded-md bg-spark/10 px-2.5 py-1 text-xs font-bold text-spark">
  {listings.length}
</span>
</div>

    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing: Listing & { owner: Profile }) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          owner={listing.owner}
        />
      ))}
    </div>
  </>
) : (
  <div className="mt-8">
    <EmptyState
      title="لا توجد فرص مطابقة"
      description="جرّب تغيير الفلاتر أو كلمة البحث، أو كن أول من ينشر فرصة جديدة."
    />
  </div>
)}
    </div>
  );
}
