import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { CareerApplication, CareerOpening, RequiredApplicationFields } from "@/lib/types";

export const runtime = "nodejs";

const clean = (value: FormDataEntryValue | null, max = 3000) => String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
const emailPattern = /^\S+@\S+\.\S+$/;
const fallbackRequiredFields: Required<RequiredApplicationFields> = { phone: true, email: true, portfolioOrResumeUrl: true, experience: false, coverLetter: false };

function error(message: string) {
  return NextResponse.json({ error: message, message }, { status: 400 });
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(id)) return NextResponse.json({ message: "Role not found." }, { status: 404 });

  const data = await request.formData();
  if (clean(data.get("company"))) return NextResponse.json({ ok: true });

  const db = await getDb();
  const role = await db.collection<CareerOpening>("careerOpenings").findOne({ _id: new ObjectId(id), status: "open" });
  if (!role) return NextResponse.json({ message: "This role is no longer accepting applications." }, { status: 404 });

  const requiredFields = { ...fallbackRequiredFields, ...(role.requiredFields || {}) };
  const name = clean(data.get("name"), 160);
  const email = clean(data.get("email"), 200);
  const phone = clean(data.get("phone"), 60);
  const experience = clean(data.get("experience"), 160);
  const portfolioOrResumeUrl = clean(data.get("portfolioOrResumeUrl"), 500) || clean(data.get("portfolioUrl"), 500) || clean(data.get("resumeUrl"), 500);
  const message = clean(data.get("message"));

  if (!name) return error("Name is required.");
  if (requiredFields.email && !email) return error("Email address is required.");
  if (email && !emailPattern.test(email)) return error("Please enter a valid email address.");
  if (requiredFields.phone && !phone) return error("Phone number is required.");
  if (requiredFields.portfolioOrResumeUrl && !portfolioOrResumeUrl) return error("Portfolio / Resume link is required.");
  if (portfolioOrResumeUrl && !isValidUrl(portfolioOrResumeUrl)) return error("Please enter a valid Portfolio / Resume link.");
  if (requiredFields.experience && !experience) return error("Experience is required.");
  if (requiredFields.coverLetter && !message) return error("Cover letter is required.");

  await db.collection<CareerApplication>("careerApplications").insertOne({
    careerId: role._id!,
    role: role.title,
    name,
    email,
    phone,
    experience,
    portfolioOrResumeUrl,
    portfolioUrl: portfolioOrResumeUrl,
    message,
    status: "new",
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
