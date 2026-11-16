import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { portfolioCollection } from "@/lib/portfolio";

export class PortfolioError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const uploadDirectory = path.resolve(process.env.PORTFOLIO_UPLOAD_DIR || path.join(process.cwd(), "public/uploads/clients"));
const safeFilename = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;
const prefix = "/api/portfolio-logos/";
export async function readLogo(filename: string) {
  if (!safeFilename.test(filename)) throw new PortfolioError("Logo not found.", 404);
  return readFile(path.join(uploadDirectory, filename));
}
export async function saveLogo(file: File) {
  if (!file.size || file.size > 2 * 1024 * 1024) throw new PortfolioError("Logo must be between 1 byte and 2 MB.");
  const extension = path.extname(file.name).toLowerCase();
  const formats: Record<string, [string, string]> = { ".png": ["image/png", "png"], ".jpg": ["image/jpeg", "jpeg"], ".jpeg": ["image/jpeg", "jpeg"], ".webp": ["image/webp", "webp"], ".svg": ["image/svg+xml", "svg"] };
  const expected = formats[extension];
  if (!expected || file.type !== expected[0]) throw new PortfolioError("Upload a PNG, JPG, JPEG, WebP or SVG with a matching MIME type.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (extension === ".svg") {
    const svg = bytes.toString("utf8");
    if (/<!DOCTYPE|<!ENTITY|<script|<foreignObject|\bon\w+\s*=|(?:href|src)\s*=|url\(\s*(?!#)/i.test(svg)) throw new PortfolioError("SVG must be self-contained and contain no scripts or external resources.");
  }
  let output: Buffer;
  try {
    const image = sharp(bytes, { limitInputPixels: 16000000, failOn: "warning" });
    const metadata = await image.metadata();
    if (metadata.format !== expected[1]) throw new Error("Format mismatch");
    output = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  } catch { throw new PortfolioError("The logo is invalid, damaged, or exceeds the 16 megapixel limit."); }
  await mkdir(uploadDirectory, { recursive: true, mode: 0o750 });
  const filename = `${randomUUID()}.webp`;
  await writeFile(path.join(uploadDirectory, filename), output, { flag: "wx", mode: 0o640 });
  return `${prefix}${filename}`;
}
export async function removeUnusedLogo(url: string) {
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!safeFilename.test(filename)) return;
  try {
    if (await (await portfolioCollection()).countDocuments({ logoUrl: url })) return;
    await unlink(path.join(uploadDirectory, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("An unused portfolio logo could not be removed.");
  }
}
