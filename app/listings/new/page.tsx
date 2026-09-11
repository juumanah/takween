import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/app/actions/listings";
import { LISTING_TYPE_LABELS_AR, MODE_LABELS_AR } from "@/types/database";
import Link from "next/link";

export default async function NewListingPage() {
  const supabase = createClient();
  const { data: skills } = await supabase
  .from("skills")
  .select("id, name")
  .order("name");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/listings/new");
  const { data: profile } = await supabase
  .from("profile_contacts")
  .select("contact_method")
  .eq("user_id", user.id)
  .maybeSingle();
if (!profile?.contact_method) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <div className="rounded-2xl border border-spark/15 bg-spark/5 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          أضف وسيلة تواصل أولًا
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          نحتاج وسيلة تواصل حتى يتمكن أعضاء الفريق من التواصل معك بعد قبول طلباتهم.
        </p>

        <Link
          href="/profile/edit?next=/listings/new"
          className="btn-primary mt-5 inline-block"
        >
          إضافة وسيلة تواصل
        </Link>
      </div>
    </div>
  );
}

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-ink">انشر فرصة جديدة</h1>
      <p className="mt-2 text-sm text-ink-400">
      شارك مشروعك وحدد المهارات والأعضاء الذين تبحث عنهم.
      </p>

      
<form action={createListing} className="mt-8 space-y-5">
  
```


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

        <fieldset>
  <legend className="mb-1.5 text-sm font-bold text-ink-600">
    المهارات المطلوبة للمشروع
  </legend>
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
            className="h-4 w-4 shrink-0"
          />
          <span>{skill.name}</span>
        </label>
      ))}
    </div>
  </div>
</details>
        </fieldset>

        <fieldset>
  <legend className="mb-1.5 text-sm font-bold text-ink-600">
    المهارات التي ستقدمها للمشروع
  </legend>
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
            className="h-4 w-4 shrink-0"
          />
          <span>{skill.name}</span>
        </label>
      ))}
    </div>
  </div>
</details>
</fieldset>

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
