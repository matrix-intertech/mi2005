import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { PortfolioError } from "@/lib/portfolio-upload";

export async function authorizePortfolio(request: Request) {
  if (!(await isAdmin())) throw new PortfolioError("Admin sign-in required.", 401);
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") throw new PortfolioError("Request origin is not allowed.", 403);
  }
}
export function portfolioError(error: unknown) {
  if (error instanceof PortfolioError) return NextResponse.json({ message: error.message }, { status: error.status });
  if ((error as { code?: number })?.code === 11000) return NextResponse.json({ message: "A client with this company name already exists, or this request was already submitted." }, { status: 409 });
  console.error("Portfolio request failed.");
  return NextResponse.json({ message: "Unable to save portfolio changes. Please try again." }, { status: 500 });
}
export async function portfolioForm(request: Request) {
  // Limit the actual body even when Content-Length is missing or inaccurate.
  const reader = request.body?.getReader();
  if (!reader) throw new PortfolioError("Form data is required.");
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 2 * 1024 * 1024 + 65536) { await reader.cancel(); throw new PortfolioError("Logo must not exceed 2 MB.", 413); }
    chunks.push(value);
  }
  try { return await new Response(Buffer.concat(chunks), { headers: { "content-type": request.headers.get("content-type") || "" } }).formData(); }
  catch { throw new PortfolioError("Invalid form data."); }
}
function text(form: FormData, name: string, max: number, required = false) {
  const raw = form.get(name);
  if (raw !== null && typeof raw !== "string") throw new PortfolioError(`Invalid ${name}.`);
  const value = (raw || "").normalize("NFKC").replace(/[<>\u0000-\u001f\u007f]/g, "").trim();
  if ((required && !value) || value.length > max) throw new PortfolioError(`${name === "companyName" ? "Company name" : "Logo alt text"} must be ${required ? "1" : "0"}?${max} characters.`);
  return value;
}
export function clientFields(form: FormData, partial = false) {
  const fields: { companyName?: string; companyKey?: string; logoAlt?: string; isPublic?: boolean; displayOrder?: number } = {};
  if (!partial || form.has("companyName")) { fields.companyName = text(form, "companyName", 160, true); fields.companyKey = fields.companyName.toLowerCase(); }
  if (!partial || form.has("logoAlt")) fields.logoAlt = text(form, "logoAlt", 200) || fields.companyName || "";
  if (!partial || form.has("isPublic")) {
    const status = form.get("isPublic");
    if (status !== "true" && status !== "false") throw new PortfolioError("Public Display must be enabled or disabled.");
    fields.isPublic = status === "true";
  }
  if (!partial || form.has("displayOrder")) {
    const order = form.get("displayOrder");
    if (order !== null && typeof order !== "string") throw new PortfolioError("Invalid display order.");
    const number = Number(order || 0);
    if (!Number.isSafeInteger(number) || Math.abs(number) > 1000000) throw new PortfolioError("Display order must be a whole number between -1000000 and 1000000.");
    fields.displayOrder = number;
  }
  return fields;
}
