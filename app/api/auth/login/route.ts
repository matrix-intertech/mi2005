import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const current = attempts.get(key);
  if (current && current.resetAt > Date.now() && current.count >= 5) return NextResponse.json({ message: "Unable to sign in. Please wait and try again." }, { status: 429 });
  const data = await request.formData();
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");
  const valid = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && email === process.env.ADMIN_EMAIL.toLowerCase() && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH));
  if (!valid) {
    attempts.set(key, { count: (current?.count || 0) + 1, resetAt: Date.now() + 15 * 60 * 1000 });
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
  attempts.delete(key);
  await createSession();
  return NextResponse.json({ ok: true });
}