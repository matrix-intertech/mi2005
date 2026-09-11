import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { CareerApplication, CareerOpening } from "@/lib/types";
export const runtime = "nodejs";
const clean = (value: FormDataEntryValue | null, max = 3000) => String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ message: "Role not found." }, { status: 404 });
  const data = await request.formData();
  if (clean(data.get("company"))) return NextResponse.json({ ok: true });
  const name = clean(data.get("name"), 160), email = clean(data.get("email"), 200), phone = clean(data.get("phone"), 60), experience = clean(data.get("experience"), 160), portfolioUrl = clean(data.get("portfolioUrl"), 500), resumeUrl = clean(data.get("resumeUrl"), 500), message = clean(data.get("message"));
  if (!name || !phone || !experience || !message || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ message: "Please complete the required fields with a valid email." }, { status: 400 });
  const db = await getDb(); const role = await db.collection<CareerOpening>("careerOpenings").findOne({ _id: new ObjectId(id), status: "open" });
  if (!role) return NextResponse.json({ message: "This role is no longer accepting applications." }, { status: 404 });
  await db.collection<CareerApplication>("careerApplications").insertOne({ careerId: role._id!, role: role.title, name, email, phone, experience, portfolioUrl, resumeUrl, message, status: "new", createdAt: new Date() });
  return NextResponse.json({ ok: true });
}
