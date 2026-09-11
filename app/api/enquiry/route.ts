import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getDb } from "@/lib/db";
import type { Enquiry } from "@/lib/types";

export const runtime = "nodejs";
const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const;
const rateWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const smtpPassword = process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim();
  const missing = [...requiredEnv.filter((key) => !process.env[key]?.trim()), ...(!smtpPassword ? ["SMTP_PASS"] : [])];
  if (missing.length > 0) return NextResponse.json({ missing }, { status: 503 });
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) return NextResponse.json({ message: "Too many enquiries were submitted. Please wait a few minutes and try again." }, { status: 429 });
  const formData = await request.formData();
  if (String(formData.get("company") || "").trim()) return NextResponse.json({ ok: true });
  const name = clean(formData.get("name")), email = clean(formData.get("email")), phone = clean(formData.get("phone")), companyName = clean(formData.get("companyName")), projectType = clean(formData.get("projectType")), location = clean(formData.get("location")), approxArea = clean(formData.get("approxArea")), message = clean(formData.get("message"));
  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ message: "Please share your name, a valid email and a project brief." }, { status: 400 });
  const enquiry: Enquiry = { name, email, phone, companyName, projectType, location, approxArea, message, status: "new", source: projectType?.toLowerCase().includes("project") ? "project-enquiry" : "contact", createdAt: new Date() };
  try { await (await getDb()).collection<Enquiry>("enquiries").insertOne(enquiry); } catch { return NextResponse.json({ message: "We could not save your enquiry right now. Please try again shortly." }, { status: 503 }); }
  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) return NextResponse.json({ message: "Email delivery is not configured. SMTP_PORT must be a valid port number." }, { status: 503 });
  try {
    await nodemailer.createTransport({ host: process.env.SMTP_HOST!, port, secure: port === 465, requireTLS: port !== 465, auth: { user: process.env.SMTP_USER!, pass: smtpPassword! } }).sendMail({ from: process.env.CONTACT_FROM_EMAIL!, to: process.env.CONTACT_TO_EMAIL!, cc: process.env.CONTACT_CC_EMAIL?.trim() || undefined, replyTo: email, subject: `New Matrix Intertech enquiry from ${name}`, text: ["New Matrix Intertech enquiry", "", `Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, `Company: ${companyName || "Not provided"}`, `Project type: ${projectType || "Not provided"}`, `Location: ${location || "Not provided"}`, `Approx. area: ${approxArea || "Not provided"}`, "", "Message:", message].join("\n") });
  } catch { return NextResponse.json({ message: "Your enquiry was saved, but email delivery is temporarily unavailable." }, { status: 502 }); }
  return NextResponse.json({ ok: true });
}
function clean(value: FormDataEntryValue | null) { return String(value || "").replace(/[<>]/g, "").trim().slice(0, 3000); }
function getClientKey(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || "local"; }
function isRateLimited(key: string) { const now = Date.now(), current = rateLimit.get(key); if (!current || current.resetAt <= now) { rateLimit.set(key, { count: 1, resetAt: now + rateWindowMs }); return false; } current.count += 1; return current.count > maxRequestsPerWindow; }
