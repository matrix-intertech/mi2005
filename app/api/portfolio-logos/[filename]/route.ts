import { readLogo } from "@/lib/portfolio-upload";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  try {
    const bytes = await readLogo((await context.params).filename);
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch { return new Response("Logo not found.", { status: 404 }); }
}
