import Link from "next/link";
import {
  LISTING_TYPE_LABELS_AR,
  MODE_LABELS_AR,
  type Listing,
  type Profile,
} from "@/types/database";

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 30) return `قبل ${days} يوم`;
  const months = Math.floor(days / 30);
  return `قبل ${months} شهر`;
}

export default function ListingCard({
  listing,
  owner,
}: {
  listing: Listing;
  owner?: Pick<Profile, "full_name"> | null;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col rounded-2xl border border-ink-100 bg-paper p-5 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-bold text-ink-600">
          {LISTING_TYPE_LABELS_AR[listing.type]}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            listing.looking_for === "members"
              ? "bg-spark-50 text-spark-700"
              : "bg-signal/15 text-ink-800"
          }`}
        >
          {listing.looking_for === "members" ? "يبحث عن أعضاء" : "يبحث عن فريق"}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-ink group-hover:text-spark transition-colors line-clamp-2">
        {listing.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-400 line-clamp-2">
        {listing.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-400">
        <span>👥 {listing.members_needed} أعضاء مطلوبين</span>
        <span>·</span>
        <span>{MODE_LABELS_AR[listing.mode]}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
        <span>{owner?.full_name || "مستخدم تكوين"}</span>
        <span>{timeAgo(listing.created_at)}</span>
      </div>
    </Link>
  );
}
