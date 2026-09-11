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
  const looking_for_team = formData.get("looking_for_team") === "on";
  const selectedSkillIds = formData.getAll("skills").map(String);
  const next = String(formData.get("next") || "").trim();
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
      avatar_url: avatar_url || null,
      looking_for_team,
    })
    .eq("id", user.id);

    
    if (error) {
  throw new Error("تعذّر حفظ التغييرات. حاول مرة أخرى.");
}
const { error: contactError } = await supabase
  .from("profile_contacts")
  .upsert(
    {
      user_id: user.id,
      contact_method,
    },
    {
      onConflict: "user_id",
    }
  );

if (contactError) {
  throw new Error("تعذّر حفظ وسيلة التواصل. حاول مرة أخرى.");
}
const { error: deleteSkillsError } = await supabase
  .from("profile_skills")
  .delete()
  .eq("profile_id", user.id);

if (deleteSkillsError) {
  throw new Error("تعذّر تحديث المهارات. حاول مرة أخرى.");
}

if (selectedSkillIds.length > 0) {
  const { error: insertSkillsError } = await supabase
    .from("profile_skills")
    .insert(
      selectedSkillIds.map((skill_id) => ({
        profile_id: user.id,
        skill_id,
      }))
    );

  if (insertSkillsError) {
    throw new Error("تعذّر حفظ المهارات. حاول مرة أخرى.");
  }
}

revalidatePath("/profile/edit");
revalidatePath(`/profile/${user.id}`);

if (next.startsWith("/") && !next.startsWith("//")) {
  redirect(next);
}

redirect(`/profile/${user.id}`);
}