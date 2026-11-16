import nextEnv from "@next/env";
import { MongoClient } from "mongodb";
import { readFile, access, mkdir } from "node:fs/promises";
import path from "node:path";
nextEnv.loadEnvConfig(process.cwd());
const client = new MongoClient(process.env.MONGODB_URI || "", { serverSelectionTimeoutMS: 10000 });
try {
  const seeds = JSON.parse(await readFile(new URL("../lib/portfolio-seed.json", import.meta.url), "utf8"));
  for (const seed of seeds) await access(path.join(process.cwd(), "public", seed.logoUrl));
  const uploadDir = path.resolve(process.env.PORTFOLIO_UPLOAD_DIR || "public/uploads/clients");
  await mkdir(uploadDir, { recursive: true, mode: 0o750 });
  await access(uploadDir, 2);
  await client.connect();
  const collection = client.db().collection("portfolioClients");
  await collection.createIndexes([
    { key: { companyName: 1 } }, { key: { isPublic: 1, displayOrder: 1 } },
    { key: { createdAt: -1 } }, { key: { companyKey: 1 }, unique: true, sparse: true },
    { key: { submissionId: 1 }, unique: true, sparse: true },
  ]);
  let imported = 0;
  for (const [displayOrder, seed] of seeds.entries()) {
    const now = new Date();
    const companyKey = seed.companyName.normalize("NFKC").trim().toLowerCase();
    const result = await collection.updateOne({ $or: [{ companyKey }, { companyName: seed.companyName }, { seedKey: seed.logoUrl }] }, { $setOnInsert: {
      ...seed, seedKey: seed.logoUrl, companyKey, logoAlt: seed.companyName, isPublic: true, displayOrder,
      createdAt: now, updatedAt: now,
    } }, { upsert: true });
    imported += result.upsertedCount;
  }
  console.log(`Portfolio import complete: ${imported} added; ${seeds.length - imported} already present. Existing records were not changed.`);
} catch {
  console.error("Portfolio import failed. Check MongoDB connectivity, indexes, local logo assets, and upload directory permissions.");
  process.exitCode = 1;
} finally { await client.close(); }
