import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
function moduleWithDriver({ failFirstConnect = false } = {}) {
  const state = { loads: 0, clients: 0, connects: 0 };
  const database = {};
  class MongoClient {
    constructor(uri) { assert.equal(uri, "test-uri"); state.clients++; }
    async connect() { state.connects++; if (failFirstConnect && state.connects === 1) throw Error("Temporary connection failure"); return this; }
    db() { return database; }
  }
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync("lib/db.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", "require", "global", "process", code)(exports, name => {
    assert.equal(name, "mongodb"); state.loads++; return { MongoClient };
  }, {}, { env: { MONGODB_URI: "test-uri" } });
  return { ...exports, state, database };
}
test("cached-page module initialization does not import the MongoDB driver", () => {
  const { state } = moduleWithDriver();
  assert.deepEqual(state, { loads: 0, clients: 0, connects: 0 });
});
test("concurrent database callers share one native MongoClient pool", async () => {
  const { getDb, state, database } = moduleWithDriver();
  const databases = await Promise.all([getDb(), getDb(), getDb()]);
  assert.ok(databases.every(db => db === database));
  assert.equal(state.clients, 1);
});
test("a connection failure can be retried using the existing pool", async () => {
  const { getDb, state, database } = moduleWithDriver({ failFirstConnect: true });
  await assert.rejects(getDb(), /Temporary connection failure/);
  assert.equal(await getDb(), database);
  assert.equal(state.clients, 1);
});
