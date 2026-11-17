import type { Db, MongoClient } from "mongodb";

const globalForMongo = global as typeof globalThis & { mongoClient?: MongoClient };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required for database operations.");
  // A cached public page must not load the MongoDB driver during its cold start.
  if (!globalForMongo.mongoClient) {
    const { MongoClient } = await import("mongodb");
    globalForMongo.mongoClient ??= new MongoClient(uri);
  }
  const client = globalForMongo.mongoClient;
  await client.connect();
  return client.db();
}
