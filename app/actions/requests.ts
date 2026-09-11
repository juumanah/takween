"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendJoinRequest(listingId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const message = String(formData.get("message") || "").trim();
  if (!message) {
    throw new Error("الرجاء كتابة رسالة قصيرة قبل الإرسال.");
  }
  const { data: profileContact } = await supabase
  .from("profile_contacts")
  .select("contact_method")
  .eq("user_id", user.id)
  .maybeSingle();

if (!profileContact?.contact_method) {
  throw new Error("أضف وسيلة تواصل قبل إرسال طلب الانضمام.");
}
  const { error } = await supabase.from("join_requests").insert({
    listing_id: listingId,
    applicant_id: user.id,
    message,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("لقد أرسلت طلب انضمام لهذه الفرصة من قبل.");
    }
    throw new Error("تعذّر إرسال الطلب. حاول مرة أخرى.");
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}

export async function respondToJoinRequest(
  requestId: string,
  listingId: string,
  status: "accepted" | "rejected"
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: request } = await supabase
    .from("join_requests")
    .select("id, listing_id")
    .eq("id", requestId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (!request) {
    throw new Error("طلب الانضمام غير موجود.");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!listing) {
    throw new Error("غير مصرح لك بتحديث هذا الطلب.");
  }

  const { error } = await supabase
    .from("join_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("listing_id", listingId);

  if (error) {
    throw new Error("تعذّر تحديث حالة الطلب.");
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}

export async function withdrawJoinRequest(requestId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: request, error } = await supabase
    .from("join_requests")
    .delete()
    .eq("id", requestId)
    .eq("applicant_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("تعذّر سحب طلب الانضمام.");
  }

  if (!request) {
    throw new Error("الطلب غير موجود أو غير مصرح لك بسحبه.");
  }

  revalidatePath("/dashboard");
}