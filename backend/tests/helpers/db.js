// Тестийн MongoDB: MONGODB_TEST_URI өгвөл түүнийг, үгүй бол санах ойн MongoDB (mongodb-memory-server) ашиглана.
// Бодит/хөгжүүлэлтийн database-д (MONGODB_URI) тест хэзээ ч бичихгүй.
import { after, before } from "node:test";
import { connectDB, disconnectDB } from "../../src/db.js";

let memoryServer = null;
let uri = null;

export async function startTestDB() {
  if (process.env.MONGODB_TEST_URI) {
    uri = process.env.MONGODB_TEST_URI;
  } else {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("studyquest-test");
  }
  await connectDB(uri);
  return uri;
}

export async function stopTestDB() {
  await disconnectDB();
  if (memoryServer) await memoryServer.stop();
}

// Backend restart-ийг дуурайх: холболтыг тасалж, дахин холбогдоно.
export async function reconnectTestDB() {
  await disconnectDB();
  await connectDB(uri);
}

export function useTestDB() {
  before(startTestDB, { timeout: 120000 });
  after(stopTestDB);
}
