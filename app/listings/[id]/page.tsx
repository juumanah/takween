import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SkillBadge from "@/components/SkillBadge";
import {
  LISTING_TYPE_LABELS_AR,
  MODE_LABELS_AR,
  STATUS_LABELS_AR,
  REQUEST_STATUS_LABELS_AR,
  type Skill,
} from "@/types/database";
import { updateListingStatus } from "@/app/actions/listings";
import { sendJoinRequest, respondToJoinRequest } from "@/app/actions/requests";
import { deleteListing } from "@/app/actions/listings";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, owner:profiles(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: listingSkills } = await supabase
    .from("listing_skills")
    .select("kind, skill:skills(*)")
    .eq("listing_id", listing.id);

  const requiredSkills: Skill[] = (listingSkills || [])
    .filter((r: any) => r.kind === "required")
    .map((r: any) => r.skill);
  const ownedSkills: Skill[] = (listingSkills || [])
    .filter((r: any) => r.kind === "owned")
    .map((r: any) => r.skill);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let currentProfile = null;

if (user) {
  const { data } = await supabase
    .from("profile_contacts")
    .select("contact_method")
    .eq("user_id", user.id)
    .maybeSingle();

  currentProfile = data;
}
  const isOwner = user?.id === listing.owner_id;

  let myRequest = null;
  if (user && !isOwner) {
    const { data } = await supabase
      .from("join_requests")
      .select("*")
      .eq("listing_id", listing.id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    myRequest = data;
  }

  let ownerContact = null;

if (user && !isOwner) {
  const { data } = await supabase
    .from("profile_contacts")
    .select("contact_method")
    .eq("user_id", listing.owner_id)
    .maybeSingle();

  ownerContact = data;
}

  let incomingRequests: any[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("join_requests")
      .select("*, applicant:profiles(*)")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false });
    incomingRequests = data || [];
  }

  let applicantContacts: Record<string, string> = {};

if (isOwner) {
  const acceptedApplicantIds = incomingRequests
    .filter((req) => req.status === "accepted")
    .map((req) => req.applicant_id);

  if (acceptedApplicantIds.length > 0) {
    const { data: contacts } = await supabase
      .from("profile_contacts")
      .select("user_id, contact_method")
      .in("user_id", acceptedApplicantIds);

    applicantContacts = Object.fromEntries(
      (contacts || []).map((contact) => [
        contact.user_id,
        contact.contact_method,
      ])
    );
  }
} 
  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:py-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-bold text-ink-600">
          {LISTING_TYPE_LABELS_AR[listing.type as keyof typeof LISTING_TYPE_LABELS_AR]}
        </span>
        <span className="rounded-full bg-spark-50 px-3 py-1 text-xs font-bold text-spark-700">
          {listing.looking_for === "members" ? "يبحث عن أعضاء" : "يبحث عن فريق"}
        </span>
        {listing.status !== "open" && (
  <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-400">
    {STATUS_LABELS_AR[listing.status as keyof typeof STATUS_LABELS_AR]}
  </span>
)}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold text-ink">{listing.title}</h1>

      <Link href={`/profile/${listing.owner.id}`} className="mt-2 inline-block text-sm font-medium text-ink-400 hover:text-spark">
        نشرها {listing.owner.full_name || "مستخدم تكوين"}
      </Link>

      <div className="mt-5">
  <h2 className="text-sm font-bold text-ink-600">عن الفرصة</h2>
  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink-600">
    {listing.description}
  </p>
</div>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-ink-100 bg-paper p-4 sm:grid-cols-4">
        <Info label="الأعضاء المطلوبين" value={String(listing.members_needed)} />
        <Info label="طريقة العمل" value={MODE_LABELS_AR[listing.mode as keyof typeof MODE_LABELS_AR]} />
        {listing.location && (
  <Info label="الموقع" value={listing.location} />
)}

{listing.deadline && (
  <Info
    label="الموعد النهائي"
    value={new Date(listing.deadline).toLocaleDateString("ar-SA")}
  />
)}
      </div>

      {listing.external_link && (
        <a
          href={listing.external_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-bold text-spark hover:text-spark-600"
        >
          رابط المشروع/الهاكاثون ←
        </a>
      )}

      {requiredSkills.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold text-ink-600">المهارات المطلوبة</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {requiredSkills.map((s) => (
              <SkillBadge key={s.id} name={s.name} tone="spark" />
            ))}
          </div>
        </div>
      )}

      {ownedSkills.length > 0 && (
        <div className="mt-3">
          <h2 className="text-sm font-bold text-ink-600">ما يقدّمه صاحب الفرصة للفريق</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {ownedSkills.map((s) => (
              <SkillBadge key={s.id} name={s.name} />
            ))}
          </div>
        </div>
      )}

      {/* Applicant view */}
      {!isOwner && (
        <div className="mt-6 border-t border-ink-100 pt-6">
          {!user ? (
            <Link href={`/login?next=/listings/${listing.id}`} className="btn-primary inline-block">
              سجّل الدخول للانضمام
            </Link>
          ) : listing.status !== "open" ? (
            <p className="text-sm text-ink-400">هذه الفرصة مغلقة حاليًا ولا تستقبل طلبات جديدة.</p>
          ) : myRequest ? (
  <div className="rounded-2xl border border-spark/15 bg-spark/5 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-display text-base font-bold text-ink">
        {myRequest.status === "pending"
          ? "طلبك قيد المراجعة"
          : myRequest.status === "accepted"
            ? "تم قبول طلبك 🎉"
            : "لم يتم قبول الطلب"}
      </p>

      <span className="rounded-md bg-paper px-2.5 py-1 text-xs font-bold text-spark">
        {REQUEST_STATUS_LABELS_AR[
          myRequest.status as keyof typeof REQUEST_STATUS_LABELS_AR
        ]}
      </span>
    </div>

    {myRequest.status === "pending" && (
      <p className="mt-2 text-sm leading-relaxed text-ink-400">
        بانتظار رد صاحب الفرصة، وبنعلمك أول ما يتم تحديث حالة طلبك.
      </p>
    )}

    {myRequest.status === "accepted" && (
      <p className="mt-3 text-sm text-ink-600">
        وسيلة تواصل صاحب الفرصة:{" "}
        <strong>
          {ownerContact?.contact_method || "لم يحدد وسيلة تواصل بعد"}
        </strong>
      </p>
    )}

    {myRequest.status === "rejected" && (
      <p className="mt-2 text-sm leading-relaxed text-ink-400">
        يمكنك استكشاف فرص أخرى والعثور على فريق يناسب مهاراتك.
      </p>
    )}
  </div>
          )  : !currentProfile?.contact_method ? (
  <div className="rounded-2xl border border-spark/15 bg-spark/5 p-5">
    <p className="font-bold text-ink">
      أضف وسيلة تواصل أولًا
    </p>

    <p className="mt-2 text-sm leading-relaxed text-ink-400">
      نحتاج وسيلة تواصل حتى يتمكن صاحب الفرصة من التواصل معك إذا تم قبول طلبك.
    </p>

    <Link
      href={`/profile/edit?next=/listings/${listing.id}`}
      className="btn-primary mt-4 inline-block"
    >
      إضافة وسيلة تواصل
    </Link>
  </div>
) : (
  <form action={sendJoinRequest.bind(null, listing.id)} className="space-y-3">
              <label className="block">
  <span className="mb-1.5 block text-sm font-bold text-ink-600">
    لماذا ترغب بالانضمام؟
  </span>

  <textarea
    name="message"
    required
    className="textarea min-h-[100px] resize-none"
    placeholder="عرّف بنفسك باختصار، واذكر المهارات أو الخبرات التي يمكنك إضافتها للفريق ولماذا تهمك هذه الفرصة."
  />
</label>
             <button type="submit" className="btn-primary">
  إرسال طلب الانضمام
</button>
            </form>
          )}
        </div>
      )}

      {/* Owner management view */}
      {isOwner && (
        <div className="mt-10 border-t border-ink-100 pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
  href={`/listings/${listing.id}/edit`}
  className="btn-secondary inline-block"
>
  تعديل الفرصة
</Link>
            <form action={updateListingStatus.bind(null, listing.id, listing.status === "open" ? "closed" : "open")}>
              <button type="submit" className="btn-secondary">
                {listing.status === "open" ? "إغلاق الفرصة" : "إعادة فتح الفرصة"}
              </button> </form>
            <Link
  href={`/listings/${listing.id}/delete`}
  className="btn-danger inline-block"
>
  حذف الفرصة
</Link>
          </div>

          {incomingRequests.length > 0 && (
  <>
    <h2 className="mt-8 font-display text-xl font-bold text-ink">
      طلبات الانضمام ({incomingRequests.length})
    </h2>

    <div className="mt-4 space-y-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-ink-100 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/profile/${req.applicant.id}`} className="font-bold text-ink hover:text-spark">
                      {req.applicant.full_name}
                    </Link>
                    <span className="text-xs font-bold text-ink-400">
                      {REQUEST_STATUS_LABELS_AR[req.status as keyof typeof REQUEST_STATUS_LABELS_AR]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    {req.applicant.major}
                    {req.applicant.university ? ` · ${req.applicant.university}` : ""}
                  </p>
                  {req.applicant.bio && <p className="mt-2 text-sm text-ink-600">{req.applicant.bio}</p>}
                  <p className="mt-3 rounded-xl bg-ink-50/60 p-3 text-sm text-ink-600">{req.message}</p>

                  {req.status === "pending" ? (
                    <div className="mt-4 flex gap-3">
                      <form action={respondToJoinRequest.bind(null, req.id, listing.id, "accepted")}>
                        <button type="submit" className="btn-primary">
                          قبول
                        </button>
                      </form>
                      <form action={respondToJoinRequest.bind(null, req.id, listing.id, "rejected")}>
                        <button type="submit" className="btn-secondary">
                          رفض
                        </button>
                      </form>
                    </div>
                  ) : req.status === "accepted" ? (
                    <p className="mt-3 text-sm text-green-700">
                      وسيلة التواصل: <strong>{applicantContacts[req.applicant_id] || "لم يحدد وسيلة تواصل بعد"}</strong>
                    </p>
                  ) : null}
                </div>
                            ))}
            </div>
          </>
        )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="mt-1.5 text-base font-bold text-ink">{value}</p>
    </div>
  );
}
