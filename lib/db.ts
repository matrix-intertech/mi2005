import { Db, MongoClient } from "mongodb";

const globalForMongo = global as typeof globalThis & { mongoClient?: MongoClient };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required for database operations.");
  const client = globalForMongo.mongoClient ?? new MongoClient(uri);
  if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = client;
  await client.connect();
  return client.db();
}
