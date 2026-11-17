import { invalidatePublicPortfolio } from "@/lib/public-portfolio-cache";
import { NextResponse } from "next/server";
import { portfolioCollection, serializeClient } from "@/lib/portfolio";
import { authorizePortfolio, clientFields, portfolioError, portfolioForm } from "@/lib/portfolio-api";
import { PortfolioError, saveLogo, removeUnusedLogo } from "@/lib/portfolio-upload";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
async function clientId(context: Context) {
  const { id } = await context.params;
  if (!/^[0-9a-f]{24}$/i.test(id)) throw new PortfolioError("Client not found.", 404);
  const { ObjectId } = await import("mongodb");
  return new ObjectId(id);
}
export async function PATCH(request: Request, context: Context) {
  let uploaded: string | undefined;
  try {
    await authorizePortfolio(request);
    const id = await clientId(context);
    const form = await portfolioForm(request);
    const fields = clientFields(form, true);
    const collection = await portfolioCollection();
    const current = await collection.findOne({ _id: id });
    if (!current) throw new PortfolioError("Client not found.", 404);
    const version = form.get("updatedAt");
    if (version !== current.updatedAt.toISOString()) throw new PortfolioError("This client has changed. Refresh the list before editing again.", 409);
    if (fields.logoAlt === "") fields.logoAlt = fields.companyName || current.companyName;
    const logo = form.get("logo");
    if (logo !== null && !(logo instanceof File)) throw new PortfolioError("Invalid logo upload.");
    if (logo instanceof File && logo.size) uploaded = await saveLogo(logo);
    const updated = await collection.findOneAndUpdate({ _id: id, updatedAt: current.updatedAt }, { $set: { ...fields, ...(uploaded ? { logoUrl: uploaded } : {}), updatedAt: new Date(Math.max(Date.now(), current.updatedAt.getTime() + 1)) } }, { returnDocument: "after" });
    if (!updated) throw new PortfolioError("This client has changed. Refresh the list before editing again.", 409);
    invalidatePublicPortfolio();
    if (uploaded) await removeUnusedLogo(current.logoUrl);
    return NextResponse.json({ client: serializeClient(updated) });
  } catch (error) {
    if (uploaded) await removeUnusedLogo(uploaded);
    return portfolioError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    await authorizePortfolio(request);
    const id = await clientId(context);
    const version = request.headers.get("if-unmodified-since");
    if (!version || Number.isNaN(Date.parse(version))) throw new PortfolioError("The current client version is required.");
    const deleted = await (await portfolioCollection()).findOneAndDelete({ _id: id, updatedAt: new Date(version) });
    if (!deleted) throw new PortfolioError("Client was changed or removed. Refresh the list before deleting.", 409);
    invalidatePublicPortfolio();
    await removeUnusedLogo(deleted.logoUrl);
    return NextResponse.json({ ok: true });
  } catch (error) { return portfolioError(error); }
}
