import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/app/actions/listings";
import { LISTING_TYPE_LABELS_AR, MODE_LABELS_AR } from "@/types/database";

export default async function NewListingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/listings/new");

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-ink">انشر فرصة جديدة</h1>
      <p className="mt-2 text-sm text-ink-400">
        اختر ما إذا كنت تبحث عن أعضاء لمشروعك، أو تبحث عن فريق تنضم إليه.
      </p>

      <form action={createListing} className="mt-8 space-y-5">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="mb-1.5 block text-sm font-bold text-ink-600">نوع الطلب</legend>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-100 p-3 has-[:checked]:border-spark has-[:checked]:bg-spark-50">
            <input type="radio" name="looking_for" value="members" defaultChecked required className="accent-spark" />
            <span className="text-sm font-medium text-ink">أبحث عن أعضاء</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-100 p-3 has-[:checked]:border-spark has-[:checked]:bg-spark-50">
            <input type="radio" name="looking_for" value="team" className="accent-spark" />
            <span className="text-sm font-medium text-ink">أبحث عن فريق</span>
          </label>
        </fieldset>

        <Field label="عنوان المشروع / الهاكاثون">
          <input name="title" required maxLength={120} className="input" placeholder="مثال: تطبيق لتنظيم المذاكرة الجماعية" />
        </Field>

        <Field label="نوع الفرصة">
          <select name="type" required defaultValue="hackathon" className="select">
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
            placeholder="اشرح فكرة المشروع، وما الذي تحتاجه بالضبط من الأعضاء أو الفريق."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="عدد الأعضاء المطلوبين">
            <input type="number" name="members_needed" min={1} defaultValue={1} required className="input" />
          </Field>
          <Field label="الموعد النهائي (اختياري)">
            <input type="date" name="deadline" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="طريقة العمل">
            <select name="mode" required defaultValue="online" className="select">
              {Object.entries(MODE_LABELS_AR).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الموقع (اختياري)">
            <input name="location" className="input" placeholder="مثال: الرياض" />
          </Field>
        </div>

        <Field label="رابط الهاكاثون أو المشروع (اختياري)">
          <input type="url" name="external_link" className="input" placeholder="https://" />
        </Field>

        <Field label="المهارات المطلوبة" hint="افصل بينها بفاصلة، مثال: React, Figma">
          <input name="required_skills" className="input" placeholder="React, UI/UX Design" />
        </Field>

        <Field label="مهاراتك التي تجلبها للمشروع (اختياري)" hint="افصل بينها بفاصلة">
          <input name="owned_skills" className="input" placeholder="Product Management" />
        </Field>

        <button type="submit" className="btn-primary w-full">
          نشر الفرصة
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}
