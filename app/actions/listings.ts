"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ListingStatus } from "@/types/database";

async function resolveSkillIds(supabase: ReturnType<typeof createClient>, rawNames: string) {
  const names = Array.from(
    new Set(
      rawNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );

  const ids: string[] = [];
  for (const name of names) {
    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      ids.push(existing.id);
      continue;
    }

    const { data: created, error } = await supabase
      .from("skills")
      .insert({ name })
      .select("id")
      .single();

    if (!error && created) ids.push(created.id);
  }
  return ids;
}

export async function createListing(formData: FormData) {
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
  const external_link = String(formData.get("external_link") || "").trim() || null;
  const requiredSkillsRaw = String(formData.get("required_skills") || "");
  const ownedSkillsRaw = String(formData.get("owned_skills") || "");

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
    await supabase.from("listing_skills").insert(rows);
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

export async function deleteListing(listingId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("listings").delete().eq("id", listingId).eq("owner_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  redirect("/dashboard");
}
