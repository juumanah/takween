import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).maybeSingle();
  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", profile.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-start gap-5">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-spark-50 text-2xl font-display font-bold text-spark-700">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
          ) : (
            profile.full_name?.charAt(0) || "ت"
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-ink">{profile.full_name}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {profile.major}
            {profile.university ? ` · ${profile.university}` : ""}
          </p>
          {isOwnProfile && (
            <Link href="/profile/edit" className="mt-3 inline-block text-sm font-bold text-spark hover:text-spark-600">
              تعديل الملف الشخصي
            </Link>
          )}
        </div>
      </div>

      {profile.bio && <p className="mt-6 leading-relaxed text-ink-600">{profile.bio}</p>}

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink">فرص منشورة ({listings?.length || 0})</h2>
        {listings && listings.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} owner={profile} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="لا توجد فرص منشورة حاليًا" />
          </div>
        )}
      </div>
    </div>
  );
}
