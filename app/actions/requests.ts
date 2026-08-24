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

  await supabase.from("join_requests").update({ status }).eq("id", requestId);

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}

export async function withdrawJoinRequest(requestId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("join_requests").delete().eq("id", requestId).eq("applicant_id", user.id);

  revalidatePath("/dashboard");
}
