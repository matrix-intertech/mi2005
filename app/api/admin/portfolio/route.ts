import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { portfolioCollection, serializeClient, type PortfolioClient } from "@/lib/portfolio";
import { authorizePortfolio, clientFields, portfolioError, portfolioForm } from "@/lib/portfolio-api";
import { PortfolioError, saveLogo, removeUnusedLogo } from "@/lib/portfolio-upload";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await authorizePortfolio(request);
    const clients = await (await portfolioCollection()).find().sort({ displayOrder: 1, companyName: 1 }).toArray();
    return NextResponse.json({ clients: clients.map(serializeClient) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return portfolioError(error); }
}
export async function POST(request: Request) {
  let uploaded: string | undefined;
  try {
    await authorizePortfolio(request);
    const form = await portfolioForm(request);
    const fields = clientFields(form);
    const submissionId = form.get("submissionId");
    if (typeof submissionId !== "string" || !/^[0-9a-f-]{36}$/.test(submissionId)) throw new PortfolioError("A valid submission ID is required.");
    const collection = await portfolioCollection();
    const previous = await collection.findOne({ submissionId });
    if (previous) return NextResponse.json({ client: serializeClient(previous) });
    if (await collection.findOne({ companyKey: fields.companyKey })) throw new PortfolioError("A client with this company name already exists.", 409);
    const logo = form.get("logo");
    if (!(logo instanceof File) || !logo.size) throw new PortfolioError("Company logo is required.");
    uploaded = await saveLogo(logo);
    const now = new Date();
    const client = { ...fields, _id: new ObjectId(), logoUrl: uploaded, submissionId, createdAt: now, updatedAt: now } as PortfolioClient;
    await collection.insertOne(client);
    return NextResponse.json({ client: serializeClient(client) }, { status: 201 });
  } catch (error) {
    if (uploaded) await removeUnusedLogo(uploaded);
    return portfolioError(error);
  }
}
