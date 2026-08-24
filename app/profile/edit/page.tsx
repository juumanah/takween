import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions/profile";

export default async function EditProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile/edit");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-ink">ملفك الشخصي</h1>
      <p className="mt-2 text-sm text-ink-400">
        هذه المعلومات تظهر للآخرين عند إرسال أو استلام طلبات الانضمام.
      </p>

      <form action={updateProfile} className="mt-8 space-y-5">
        <Field label="الاسم الكامل">
          <input name="full_name" required defaultValue={profile?.full_name || ""} className="input" />
        </Field>

        <Field label="التخصص">
          <input name="major" defaultValue={profile?.major || ""} className="input" placeholder="مثال: هندسة برمجيات" />
        </Field>

        <Field label="الجامعة (اختياري)">
          <input name="university" defaultValue={profile?.university || ""} className="input" />
        </Field>

        <Field label="نبذة قصيرة">
          <textarea
            name="bio"
            defaultValue={profile?.bio || ""}
            className="textarea"
            placeholder="عرّف بنفسك باختصار: مهاراتك، اهتماماتك، وما تبحث عنه."
          />
        </Field>

        <Field
          label="وسيلة التواصل"
          hint="تظهر فقط للطرف الآخر بعد قبول طلب الانضمام (رقم واتساب، بريد، أو رابط)"
        >
          <input name="contact_method" defaultValue={profile?.contact_method || ""} className="input" placeholder="مثال: 05xxxxxxxx أو بريدك الإلكتروني" />
        </Field>

        <Field label="رابط صورة شخصية (اختياري)">
          <input name="avatar_url" type="url" defaultValue={profile?.avatar_url || ""} className="input" placeholder="https://" />
        </Field>

        <button type="submit" className="btn-primary w-full">
          حفظ التغييرات
        </button>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}
