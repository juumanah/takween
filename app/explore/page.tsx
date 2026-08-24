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

      <form method="GET" className="grid grid-cols-2 gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 p-4 sm:grid-cols-5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ابحث بالعنوان أو الوصف..."
          className="input col-span-2 sm:col-span-2"
        />
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
          placeholder="الموقع (مثال: جدة)"
          className="input col-span-2 sm:col-span-1"
        />
        <button type="submit" className="btn-primary col-span-2 sm:col-span-1">
          تطبيق الفلاتر
        </button>
        {(q || type || mode || looking_for || location) && (
          <a href="/explore" className="btn-secondary col-span-2 text-center sm:col-span-1">
            مسح الفلاتر
          </a>
        )}
      </form>

      {listings && listings.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: Listing & { owner: Profile }) => (
            <ListingCard key={listing.id} listing={listing} owner={listing.owner} />
          ))}
        </div>
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
