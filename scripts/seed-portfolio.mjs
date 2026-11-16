import nextEnv from "@next/env";
import { MongoClient } from "mongodb";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Fill missing/blank fields only. In particular, false and 0 are valid admin values.
const fill = (field, fallback) => ({
  $cond: [{ $in: [{ $ifNull: [`$${field}`, null] }, [null, ""]] }, fallback, `$${field}`],
});
export async function seedPortfolio(db) {
  const seeds = JSON.parse(await readFile(new URL("../lib/portfolio-seed.json", import.meta.url), "utf8"));
  for (const seed of seeds) await access(path.join(process.cwd(), "public", seed.logoUrl));
  const collection = db.collection("portfolioClients");
  await collection.createIndexes([
    { key: { companyName: 1 } }, { key: { isPublic: 1, displayOrder: 1 } },
    { key: { createdAt: -1 } }, { key: { companyKey: 1 }, unique: true, sparse: true },
    { key: { submissionId: 1 }, unique: true, sparse: true },
    { key: { seedKey: 1 }, unique: true, sparse: true },
  ]);
  let imported = 0, repaired = 0;
  for (const [index, seed] of seeds.entries()) {
    const now = new Date();
    // This immutable identity survives company name and logo changes in the admin UI.
    const seedKey = seed.logoUrl;
    const names = [seed.companyName, ...(seed.companyName === "Radio City" ? ["91.1 FM Radio City"] : [])];
    const companyName = fill("companyName", { $literal: seed.companyName });
    const result = await collection.updateOne({ $or: [
      { seedKey }, { companyKey: { $in: names.map(name => name.normalize("NFKC").toLowerCase()) } },
      { companyName: { $in: names } },
    ] }, [{ $set: {
      seedKey: fill("seedKey", { $literal: seedKey }),
      companyName,
      companyKey: fill("companyKey", { $toLower: { $trim: { input: companyName } } }),
      logoUrl: fill("logoUrl", { $literal: seed.logoUrl }),
      logoAlt: fill("logoAlt", companyName),
      isPublic: fill("isPublic", true),
      displayOrder: fill("displayOrder", index + 1),
      createdAt: fill("createdAt", now),
      updatedAt: fill("updatedAt", now),
    } }], { upsert: true });
    imported += result.upsertedCount;
    repaired += result.modifiedCount;
  }
  return { imported, repaired, unchanged: seeds.length - imported - repaired };
}

async function main() {
  let client;
  try {
    nextEnv.loadEnvConfig(process.cwd());
    if (!process.env.MONGODB_URI) throw new Error("Missing database configuration");
    client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    const result = await seedPortfolio(client.db());
    console.log(`Portfolio restore: ${result.imported} added; ${result.repaired} repaired/identified; ${result.unchanged} unchanged. Admin values and other companies preserved.`);
  } catch {
    console.error("Portfolio restore failed. Check configured MongoDB connectivity, indexes, and existing local logo files. No connection details are logged.");
    process.exitCode = 1;
  } finally { await client?.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
