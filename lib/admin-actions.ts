"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";
import type { CareerOpening } from "@/lib/types";

const clean = (value: FormDataEntryValue | null, max = 3000) => String(value || "").replace(/[<>]/g, "").trim().slice(0, max);

function readRequiredFields(formData: FormData) {
  return {
    phone: formData.get("required_phone") === "on",
    email: formData.get("required_email") === "on",
    portfolioOrResumeUrl: formData.get("required_portfolioOrResumeUrl") === "on",
    experience: formData.get("required_experience") === "on",
    coverLetter: formData.get("required_coverLetter") === "on",
  };
}

export async function updateEnquiryStatus(formData: FormData) {
  await requireAdmin(); const { ObjectId } = await import("mongodb"); const id = clean(formData.get("id"), 64), status = clean(formData.get("status"), 16);
  if (ObjectId.isValid(id) && ["new", "read", "archived"].includes(status)) await (await getDb()).collection("enquiries").updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  revalidatePath("/dashboard/enquiries"); revalidatePath(`/dashboard/enquiries/${id}`); revalidatePath("/dashboard");
}
export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin(); const { ObjectId } = await import("mongodb"); const id = clean(formData.get("id"), 64), status = clean(formData.get("status"), 16);
  if (ObjectId.isValid(id) && ["new", "reviewed", "archived"].includes(status)) await (await getDb()).collection("careerApplications").updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
  revalidatePath("/dashboard/applications"); revalidatePath(`/dashboard/applications/${id}`); revalidatePath("/dashboard");
}
export async function saveCareer(formData: FormData) {
  await requireAdmin(); const { ObjectId } = await import("mongodb"); const id = clean(formData.get("id"), 64), now = new Date();
  const opening = { title: clean(formData.get("title"), 160), department: clean(formData.get("department"), 120), location: clean(formData.get("location"), 120), type: clean(formData.get("type"), 32), experience: clean(formData.get("experience"), 160), summary: clean(formData.get("summary")), responsibilities: clean(formData.get("responsibilities")), requirements: clean(formData.get("requirements")), requiredFields: readRequiredFields(formData), status: clean(formData.get("status"), 16), updatedAt: now };
  if (!opening.title || !opening.department || !opening.location || !opening.summary || !["Full-time", "Part-time", "Contract", "Internship"].includes(opening.type) || !["open", "closed"].includes(opening.status)) throw new Error("Please complete all required career fields.");
  const db = await getDb();
  if (ObjectId.isValid(id)) await db.collection<CareerOpening>("careerOpenings").updateOne({ _id: new ObjectId(id) }, { $set: { ...opening, type: opening.type as CareerOpening["type"], status: opening.status as CareerOpening["status"] } });
  else await db.collection<CareerOpening>("careerOpenings").insertOne({ ...opening, type: opening.type as CareerOpening["type"], status: opening.status as CareerOpening["status"], createdAt: now });
  revalidatePath("/career"); revalidatePath("/dashboard/careers"); revalidatePath("/dashboard"); redirect("/dashboard/careers");
}


