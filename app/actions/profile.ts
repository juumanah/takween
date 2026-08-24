"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const full_name = String(formData.get("full_name") || "").trim();
  const major = String(formData.get("major") || "").trim();
  const university = String(formData.get("university") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const contact_method = String(formData.get("contact_method") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();

  if (!full_name) {
    throw new Error("الاسم الكامل مطلوب.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      major,
      university,
      bio,
      contact_method,
      avatar_url: avatar_url || null,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error("تعذّر حفظ التغييرات. حاول مرة أخرى.");
  }

  revalidatePath("/profile/edit");
  revalidatePath(`/profile/${user.id}`);
  redirect(`/profile/${user.id}`);
}
