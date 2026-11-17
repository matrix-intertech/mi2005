import "server-only";
import { unstable_cache } from "next/cache";
import { PUBLIC_PORTFOLIO_TAG } from "@/lib/public-portfolio-cache";
import seeds from "@/lib/portfolio-seed.json";
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
function fallbackClients(): PortfolioClientView[] {
  return seeds.map((client, index) => ({
    ...client, id: `existing-client-${index + 1}`, logoAlt: client.companyName,
    isPublic: true, displayOrder: index + 1,
    createdAt: "1970-01-01T00:00:00.000Z", updatedAt: "1970-01-01T00:00:00.000Z",
  }));
}
async function databasePublicClients() {
  const collection = await portfolioCollection();
  const clients = await collection.find({ isPublic: true }).sort({ displayOrder: 1, companyName: 1 }).toArray();
  // An intentionally hidden portfolio is different from an unseeded collection.
  if (!clients.length && !(await collection.findOne({}, { projection: { _id: 1 } }))) return fallbackClients();
  const seen = new Set<string>();
  return clients.filter(client => {
    const key = client.companyName.normalize("NFKC").trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(serializeClient);
}
async function loadPublicClients() {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    // Do not hold a public page behind the driver's longer connection timeout.
    return await Promise.race([
      databasePublicClients(),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("Portfolio timeout")), 3000); }),
    ]);
  } catch {
    console.error("Portfolio is temporarily unavailable; displaying existing clients.");
    return fallbackClients();
  } finally { if (timeout) clearTimeout(timeout); }
}

// Only the anonymous, explicitly public view is cached. Dashboard reads bypass this.
export const publicClients = unstable_cache(loadPublicClients, ["public-portfolio-v1"], {
  tags: [PUBLIC_PORTFOLIO_TAG], revalidate: 300,
});
