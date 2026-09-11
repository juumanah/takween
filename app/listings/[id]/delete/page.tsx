import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteListing } from "@/app/actions/listings";

export default async function DeleteListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, owner_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  if (listing.owner_id !== user.id) {
    redirect(`/listings/${listing.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="rounded-2xl border border-red-100 bg-paper p-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          حذف الفرصة؟
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          أنت على وشك حذف{" "}
          <strong className="text-ink">{listing.title}</strong>.
          لا يمكن التراجع عن هذا الإجراء بعد الحذف.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
  <form action={deleteListing.bind(null, listing.id)}>
    <button type="submit" className="btn-danger">
      حذف نهائي
    </button>
  </form>

  <Link
    href={`/listings/${listing.id}`}
    className="btn-secondary inline-block"
  >
    إلغاء
  </Link>
</div>
      </div>
    </div>
  );
}