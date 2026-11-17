import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { ObjectId } from "mongodb";

function load(file, mocks, timers = globalThis) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", "setTimeout", "clearTimeout", code)(exports, name => {
    assert.ok(name in mocks, `Unexpected dependency: ${name}`);
    return mocks[name];
  }, timers.setTimeout, timers.clearTimeout);
  return exports;
}

test("public portfolio cache reuses anonymous reads and expires immediately by tag", async () => {
  let cached, reads = 0;
  let rows = [{ _id: new ObjectId(), companyName: "Example", logoUrl: "/example.webp", logoAlt: "Example", isPublic: true, displayOrder: 1, createdAt: new Date(), updatedAt: new Date() }];
  const tags = [];
  const nextCache = {
    unstable_cache(fn, keys, options) {
      assert.deepEqual(keys, ["public-portfolio-v1"]);
      assert.equal(options.revalidate, 300);
      assert.deepEqual(options.tags, ["public-portfolio"]);
      return async () => cached ??= await fn();
    },
    revalidateTag(tag, profile) { tags.push([tag, profile]); cached = undefined; },
  };
  const invalidation = load("lib/public-portfolio-cache.ts", { "server-only": {}, "next/cache": nextCache });
  const collection = {
    createIndexes: async () => {},
    find(query) {
      assert.deepEqual(query, { isPublic: true });
      return { sort: () => ({ toArray: async () => { reads++; return rows; } }) };
    },
    findOne: async () => ({ _id: new ObjectId() }),
  };
  const portfolio = load("lib/portfolio.ts", {
    "server-only": {}, "next/cache": nextCache,
    "@/lib/public-portfolio-cache": invalidation,
    "@/lib/portfolio-seed.json": { default: [] }, mongodb: { ObjectId },
    "@/lib/db": { getDb: async () => ({ collection: () => collection }) },
  });
  assert.equal((await portfolio.publicClients()).length, 1);
  await portfolio.publicClients();
  assert.equal(reads, 1);
  rows = [];
  invalidation.invalidatePublicPortfolio();
  assert.deepEqual(tags, [["public-portfolio", { expire: 0 }]]);
  assert.deepEqual(await portfolio.publicClients(), []);
  assert.equal(reads, 2);
});

class PortfolioError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function handlers() {
  const events = [];
  let authorized = true;
  const now = new Date("2026-01-01T00:00:00Z");
  const current = { _id: new ObjectId(), companyName: "Example", logoUrl: "/old.webp", updatedAt: now };
  const collection = {
    findOne: async query => query._id ? current : null,
    insertOne: async () => { events.push("create"); },
    findOneAndUpdate: async (query, update) => { events.push(update.$set.isPublic === false ? "hide" : "edit"); return { ...current, ...update.$set }; },
    findOneAndDelete: async () => { events.push("delete"); return current; },
  };
  const mocks = {
    "@/lib/public-portfolio-cache": { invalidatePublicPortfolio: () => events.push("invalidate") },
    mongodb: { ObjectId },
    "next/server": { NextResponse: { json: (data, init) => Response.json(data, init) } },
    "@/lib/portfolio": { portfolioCollection: async () => collection, serializeClient: c => ({ companyName: c.companyName }) },
    "@/lib/portfolio-api": {
      authorizePortfolio: async () => { if (!authorized) throw new PortfolioError("Unauthorized", 401); },
      clientFields: form => ({ companyName: "Example", ...(form.has("isPublic") ? { isPublic: form.get("isPublic") === "true" } : {}) }),
      portfolioForm: request => request.formData(),
      portfolioError: error => Response.json({ message: error.message }, { status: error.status || 500 }),
    },
    "@/lib/portfolio-upload": { PortfolioError, saveLogo: async () => "/new.webp", removeUnusedLogo: async () => {} },
  };
  return { root: load("app/api/admin/portfolio/route.ts", mocks), item: load("app/api/admin/portfolio/[id]/route.ts", mocks), events, current,
    deny: () => { authorized = false; } };
}

test("successful admin create, edit, visibility and delete invalidate after the database write", async () => {
  const h = handlers();
  const context = { params: Promise.resolve({ id: h.current._id.toHexString() }) };
  const form = new FormData();
  form.set("submissionId", "00000000-0000-0000-0000-000000000001");
  form.set("logo", new File(["example"], "logo.webp", { type: "image/webp" }));
  assert.equal((await h.root.POST(new Request("http://localhost/api/admin/portfolio", { method: "POST", body: form }))).status, 201);
  for (const visibility of ["true", "false"]) {
    const edit = new FormData(); edit.set("updatedAt", h.current.updatedAt.toISOString()); edit.set("isPublic", visibility);
    assert.equal((await h.item.PATCH(new Request("http://localhost", { method: "PATCH", body: edit }), context)).status, 200);
  }
  assert.equal((await h.item.DELETE(new Request("http://localhost", { method: "DELETE", headers: { "if-unmodified-since": h.current.updatedAt.toISOString() } }), context)).status, 200);
  assert.deepEqual(h.events, ["create", "invalidate", "edit", "invalidate", "hide", "invalidate", "delete", "invalidate"]);
});

test("unauthorized portfolio mutations cannot write or invalidate the public cache", async () => {
  const h = handlers(); h.deny();
  const context = { params: Promise.resolve({ id: h.current._id.toHexString() }) };
  assert.equal((await h.root.POST(new Request("http://localhost", { method: "POST" }))).status, 401);
  assert.equal((await h.item.PATCH(new Request("http://localhost", { method: "PATCH" }), context)).status, 401);
  assert.equal((await h.item.DELETE(new Request("http://localhost", { method: "DELETE" }), context)).status, 401);
  assert.deepEqual(h.events, []);
});


test("an unavailable public portfolio returns the cached fallback within the short miss budget", async () => {
  let cached, reads = 0;
  const client = { companyName: "Existing public client", logoUrl: "/existing.webp" };
  const portfolio = load("lib/portfolio.ts", {
    "server-only": {},
    "next/cache": { unstable_cache: fn => async () => cached ??= await fn() },
    "@/lib/public-portfolio-cache": { PUBLIC_PORTFOLIO_TAG: "public-portfolio" },
    "@/lib/portfolio-seed.json": { default: [client] },
    "@/lib/db": { getDb: () => { reads++; return new Promise(() => {}); } },
  }, {
    setTimeout: (callback, ms) => { assert.equal(ms, 250); return setTimeout(callback, 0); },
    clearTimeout,
  });
  const result = await portfolio.publicClients();
  assert.equal(result[0].companyName, client.companyName);
  assert.equal(result[0].isPublic, true);
  assert.deepEqual(await portfolio.publicClients(), result);
  assert.equal(reads, 1, "cached fallback must not retry MongoDB on each request");
});
