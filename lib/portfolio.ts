import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { PortfolioClientView } from "@/lib/portfolio-types";

export type PortfolioClient = {
  _id: ObjectId; companyName: string; companyKey: string; logoUrl: string;
  logoAlt: string; isPublic: boolean; displayOrder: number;
  createdAt: Date; updatedAt: Date; submissionId?: string;
};
let collectionPromise: ReturnType<typeof initialize> | undefined;
async function initialize() {
  const collection = (await getDb()).collection<PortfolioClient>("portfolioClients");
  await collection.createIndexes([
    { key: { companyName: 1 } },
    { key: { isPublic: 1, displayOrder: 1 } },
    { key: { createdAt: -1 } },
    { key: { companyKey: 1 }, unique: true, sparse: true },
    { key: { submissionId: 1 }, unique: true, sparse: true },
  ]);
  return collection;
}
export function portfolioCollection() {
  return collectionPromise ??= initialize().catch(error => { collectionPromise = undefined; throw error; });
}
export function serializeClient(client: PortfolioClient): PortfolioClientView {
  return { id: client._id.toHexString(), companyName: client.companyName, logoUrl: client.logoUrl,
    logoAlt: client.logoAlt, isPublic: client.isPublic, displayOrder: client.displayOrder,
    createdAt: client.createdAt.toISOString(), updatedAt: client.updatedAt.toISOString() };
}
export async function publicClients() {
  try {
    const clients = await (await portfolioCollection()).find({ isPublic: true }).sort({ displayOrder: 1, companyName: 1 }).toArray();
    const seen = new Set<string>();
    return clients.filter(client => {
      const key = client.companyName.normalize("NFKC").trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).map(serializeClient);
  } catch {
    console.error("Portfolio is temporarily unavailable.");
    return [];
  }
}
