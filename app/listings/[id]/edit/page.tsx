import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateListing } from "@/app/actions/listings";
import {
  LISTING_TYPE_LABELS_AR,
  MODE_LABELS_AR,
} from "@/types/database";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listings/${params.id}/edit`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, owner_id, title, type, description, members_needed, deadline, mode, location, external_link"
    )
    .eq("id", params.id)
    .maybeSingle();

  const { data: listingSkills } = await supabase
    .from("listing_skills")
    .select(`
      kind,
      skills (
        name
      )
    `)
    .eq("listing_id", params.id);

  if (!listing) {
    notFound();
  }

  if (listing.owner_id !== user.id) {
    redirect(`/listings/${listing.id}`);
  }
const { data: skills } = await supabase
  .from("skills")
  .select("id, name")
  .order("name");

  const requiredSkills = (listingSkills || [])
  .filter((item) => item.kind === "required")
  .flatMap((item) => item.skills || [])
  .map((skill) => skill.name)
  .filter(Boolean);

const ownedSkills = (listingSkills || [])
  .filter((item) => item.kind === "owned")
  .flatMap((item) => item.skills || [])
  .map((skill) => skill.name)
  .filter(Boolean);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold text-ink">
        تعديل الفرصة
      </h1>

      <p className="mt-2 text-sm text-ink-400">
        عدّل بيانات الفرصة ثم احفظ التغييرات.
      </p>

      <form
        action={updateListing.bind(null, listing.id)}
        className="mt-8 space-y-5"
      >
        <Field label="عنوان المشروع / الهاكاثون">
          <input
            name="title"
            required
            maxLength={120}
            className="input"
            defaultValue={listing.title}
          />
        </Field>

        <Field label="نوع الفرصة">
          <select
            name="type"
            required
            defaultValue={listing.type}
            className="select"
          >
            {Object.entries(LISTING_TYPE_LABELS_AR).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="الوصف">
          <textarea
            name="description"
            required
            maxLength={2000}
            className="textarea"
            defaultValue={listing.description}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="عدد الأعضاء المطلوبين">
            <input
              type="number"
              name="members_needed"
              min={1}
              required
              className="input"
              defaultValue={listing.members_needed}
            />
          </Field>

          <Field label="الموعد النهائي (اختياري)">
            <input
              type="date"
              name="deadline"
              className="input"
              defaultValue={listing.deadline || ""}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="طريقة العمل">
            <select
              name="mode"
              required
              defaultValue={listing.mode}
              className="select"
            >
              {Object.entries(MODE_LABELS_AR).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="الموقع (اختياري)">
            <input
              name="location"
              className="input"
              defaultValue={listing.location || ""}
            />
          </Field>
        </div>

        <Field label="رابط الهاكاثون أو المشروع (اختياري)">
          <input
            type="url"
            name="external_link"
            className="input"
            defaultValue={listing.external_link || ""}
          />
        </Field>

        <Field label="المهارات المطلوبة للمشروع">
          <p className="mb-2 text-xs text-ink-400">
            أضف المهارات التي تحتاجها من أعضاء فريقك.
          </p>

          <details className="rounded-xl border border-ink-100 bg-paper">
  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-600">
    اختر المهارات المطلوبة
  </summary>

  <div className="max-h-64 overflow-y-auto border-t border-ink-100 p-3">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {(skills || []).map((skill) => (
        <label
          key={skill.id}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-600 hover:bg-ink-50"
        >
          <input
            type="checkbox"
            name="required_skills"
            value={skill.name}
            defaultChecked={requiredSkills.includes(skill.name)}
            className="h-4 w-4 shrink-0"
          />
          <span>{skill.name}</span>
        </label>
      ))}
    </div>
  </div>
</details>
        </Field>

        <Field label="المهارات التي ستقدمها للمشروع">
          <p className="mb-2 text-xs text-ink-400">
            أضف المهارات التي ستساهم بها في تنفيذ المشروع.
          </p>

          <details className="rounded-xl border border-ink-100 bg-paper">
  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-600">
    اختر المهارات التي ستقدمها
  </summary>

  <div className="max-h-64 overflow-y-auto border-t border-ink-100 p-3">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {(skills || []).map((skill) => (
        <label
          key={skill.id}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-600 hover:bg-ink-50"
        >
          <input
            type="checkbox"
            name="owned_skills"
            value={skill.name}
            defaultChecked={ownedSkills.includes(skill.name)}
            className="h-4 w-4 shrink-0"
          />
          <span>{skill.name}</span>
        </label>
      ))}
    </div>
  </div>
</details>
        </Field>

        <button type="submit" className="btn-primary w-full">
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-600">
        {label}
      </span>
      {children}
    </label>
  );
}