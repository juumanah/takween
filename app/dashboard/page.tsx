import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/EmptyState";
import {
  LISTING_TYPE_LABELS_AR,
  REQUEST_STATUS_LABELS_AR,
  STATUS_LABELS_AR,
} from "@/types/database";
import { withdrawJoinRequest } from "@/app/actions/requests";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: myListings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: sentRequests } = await supabase
    .from("join_requests")
    .select("*, listing:listings(*)")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  const myListingIds = (myListings || []).map((l) => l.id);
  let receivedRequests: any[] = [];
  if (myListingIds.length > 0) {
    const { data } = await supabase
      .from("join_requests")
      .select("*, applicant:profiles(*), listing:listings(*)")
      .in("listing_id", myListingIds)
      .order("created_at", { ascending: false });
    receivedRequests = data || [];
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink">لوحتي</h1>
      <p className="mt-2 text-sm text-ink-400">تابع فرصك المنشورة وطلبات الانضمام المرسلة والمستلمة.</p>

      {/* My listings */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">فرصي المنشورة ({myListings?.length || 0})</h2>
          <Link href="/listings/new" className="text-sm font-bold text-spark hover:text-spark-600">
            + فرصة جديدة
          </Link>
        </div>

        {myListings && myListings.length > 0 ? (
          <div className="mt-4 space-y-3">
            {myListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex items-center justify-between rounded-2xl border border-ink-100 bg-paper p-4 hover:border-spark transition-colors"
              >
                <div>
                  <p className="font-bold text-ink">{listing.title}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {LISTING_TYPE_LABELS_AR[listing.type as keyof typeof LISTING_TYPE_LABELS_AR]}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    listing.status === "open" ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {STATUS_LABELS_AR[listing.status as keyof typeof STATUS_LABELS_AR]}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="لم تنشر أي فرصة بعد"
              description="انشر فرصتك الأولى ليتمكن الآخرون من الانضمام إليك."
              action={
                <Link href="/listings/new" className="btn-primary inline-block">
                  انشر فرصة
                </Link>
              }
            />
          </div>
        )}
      </section>

      {/* Received requests */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-ink">
          طلبات استلمتها ({receivedRequests.length})
        </h2>
        {receivedRequests.length > 0 ? (
          <div className="mt-4 space-y-3">
            {receivedRequests.map((req) => (
              <Link
                key={req.id}
                href={`/listings/${req.listing.id}`}
                className="flex items-center justify-between rounded-2xl border border-ink-100 bg-paper p-4 hover:border-spark transition-colors"
              >
                <div>
                  <p className="font-bold text-ink">{req.applicant.full_name}</p>
                  <p className="mt-1 text-xs text-ink-400">على فرصة: {req.listing.title}</p>
                </div>
                <span className="text-xs font-bold text-ink-400">
                  {REQUEST_STATUS_LABELS_AR[req.status as keyof typeof REQUEST_STATUS_LABELS_AR]}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-400">لا توجد طلبات مستلمة حتى الآن.</p>
        )}
      </section>

      {/* Sent requests */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-ink">
          طلبات أرسلتها ({sentRequests?.length || 0})
        </h2>
        {sentRequests && sentRequests.length > 0 ? (
          <div className="mt-4 space-y-3">
            {sentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-2xl border border-ink-100 bg-paper p-4"
              >
                <Link href={`/listings/${req.listing.id}`} className="hover:text-spark">
                  <p className="font-bold text-ink">{req.listing.title}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {REQUEST_STATUS_LABELS_AR[req.status as keyof typeof REQUEST_STATUS_LABELS_AR]}
                  </p>
                </Link>
                {req.status === "pending" && (
                  <form action={withdrawJoinRequest.bind(null, req.id)}>
                    <button type="submit" className="text-xs font-bold text-red-600 hover:text-red-700">
                      سحب الطلب
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-400">لم ترسل أي طلب انضمام حتى الآن.</p>
        )}
      </section>
    </div>
  );
}
