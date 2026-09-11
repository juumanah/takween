"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ListingStatus } from "@/types/database";
async function resolveSkillIds(
  supabase: ReturnType<typeof createClient>,
  rawNames: string
) {
  const names = Array.from(
    new Set(
      rawNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );

  if (names.length === 0) {
    return [];
  }

  const { data: skills, error } = await supabase
    .from("skills")
    .select("id, name")
    .in("name", names);

  if (error) {
    throw new Error("تعذّر التحقق من المهارات.");
  }

  const foundNames = new Set((skills || []).map((skill) => skill.name));

  const hasUnknownSkill = names.some((name) => !foundNames.has(name));

  if (hasUnknownSkill) {
    throw new Error("تم إرسال مهارة غير معتمدة.");
  }

  return (skills || []).map((skill) => skill.id);
}

export async function createListing(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileContact } = await supabase
  .from("profile_contacts")
  .select("contact_method")
  .eq("user_id", user.id)
  .maybeSingle();

if (!profileContact?.contact_method) {
  throw new Error("أضف وسيلة تواصل قبل نشر الفرصة.");
}

  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "other");
  const description = String(formData.get("description") || "").trim();
  const members_needed = Number(formData.get("members_needed") || 1);
  const deadline = String(formData.get("deadline") || "") || null;
  const mode = String(formData.get("mode") || "online");
  const location = String(formData.get("location") || "").trim() || null;
  const external_link = String(formData.get("external_link") || "").trim() || null;
  const requiredSkillsRaw = formData
  .getAll("required_skills")
  .map(String)
  .join(",");

const ownedSkillsRaw = formData
  .getAll("owned_skills")
  .map(String)
  .join(",");


  if (!title || !description) {
  throw new Error("العنوان والوصف مطلوبان.");
}

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title,
      type,
      looking_for: "members",
      description,
      members_needed: Number.isFinite(members_needed) && members_needed > 0 ? members_needed : 1,
      deadline,
      mode,
      location,
      external_link,
    })
    .select("id")
    .single();

  if (error || !listing) {
  throw new Error("تعذّر إنشاء الفرصة. حاول مرة أخرى.");
}

  const requiredIds = await resolveSkillIds(supabase, requiredSkillsRaw);
  const ownedIds = await resolveSkillIds(supabase, ownedSkillsRaw);

  const rows = [
    ...requiredIds.map((skill_id) => ({ listing_id: listing.id, skill_id, kind: "required" })),
    ...ownedIds.map((skill_id) => ({ listing_id: listing.id, skill_id, kind: "owned" })),
  ];
if (rows.length > 0) {
  const { error: insertSkillsError } = await supabase
    .from("listing_skills")
    .insert(rows);

  if (insertSkillsError) {
    throw new Error("تعذّر حفظ مهارات الفرصة.");
  }
}

  revalidatePath("/explore");
  revalidatePath("/dashboard");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingStatus(listingId: string, status: ListingStatus) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("listings").update({ status }).eq("id", listingId).eq("owner_id", user.id);

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
  revalidatePath("/explore");
}
export async function updateListing(listingId: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "other");
  const description = String(formData.get("description") || "").trim();
  const members_needed = Number(formData.get("members_needed") || 1);
  const deadline = String(formData.get("deadline") || "") || null;
  const mode = String(formData.get("mode") || "online");
  const location = String(formData.get("location") || "").trim() || null;
  const external_link =
    String(formData.get("external_link") || "").trim() || null;

  const requiredSkillsRaw = formData
  .getAll("required_skills")
  .map(String)
  .join(",");

const ownedSkillsRaw = formData
  .getAll("owned_skills")
  .map(String)
  .join(",");

  
  if (!title || !description) {
    throw new Error("العنوان والوصف مطلوبان.");
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .update({
      title,
      type,
      description,
      members_needed:
        Number.isFinite(members_needed) && members_needed > 0
          ? members_needed
          : 1,
      deadline,
      mode,
      location,
      external_link,
    })
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error || !listing) {
    throw new Error("تعذّر تحديث الفرصة.");
  }

  const requiredIds = await resolveSkillIds(
    supabase,
    requiredSkillsRaw
  );

  const ownedIds = await resolveSkillIds(
    supabase,
    ownedSkillsRaw
  );
const { error: deleteSkillsError } = await supabase
  .from("listing_skills")
  .delete()
  .eq("listing_id", listingId);

if (deleteSkillsError) {
  throw new Error("تعذّر تحديث مهارات الفرصة.");
}
  const rows = [
    ...requiredIds.map((skill_id) => ({
      listing_id: listingId,
      skill_id,
      kind: "required",
    })),
    ...ownedIds.map((skill_id) => ({
      listing_id: listingId,
      skill_id,
      kind: "owned",
    })),
  ];
if (rows.length > 0) {
  const { error: insertSkillsError } = await supabase
    .from("listing_skills")
    .insert(rows);

  if (insertSkillsError) {
    throw new Error("تعذّر حفظ مهارات الفرصة.");
  }
}

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
  revalidatePath("/explore");

  redirect(`/listings/${listingId}`);
}
export async function deleteListing(listingId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: listing, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("تعذّر حذف الفرصة.");
  }

  if (!listing) {
    throw new Error("الفرصة غير موجودة أو غير مصرح لك بحذفها.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/explore");

  redirect("/dashboard");
}