import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const exports = {};
  modules.set(name, exports);
  const code = ts.transpileModule(fs.readFileSync(`${name.replace("@/", "")}.ts`, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", code)(exports, load);
  return exports;
}
const { routeSeo, routeMetadata, absoluteUrl, sitemapEntries } = load("@/lib/seo");
const { pageSchemas, pageAnswers } = load("@/lib/structured-data");
const { isPublicCareer, jobSchema, careerMetadata } = load("@/lib/career-seo");
const role = { _id: "0123456789abcdef01234567", title: "Interior Designer", location: "New Delhi, India", type: "Full-time",
  summary: "Design interiors <safely>.", responsibilities: "Plan & coordinate.", requirements: "Design experience", experience: "3 years",
  status: "open", createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02") };

test("every public route has unique production metadata and sitemap coverage", () => {
  for (const field of ["title", "description", "path"]) assert.equal(new Set(routeSeo.map(r => r[field])).size, routeSeo.length);
  assert.equal(sitemapEntries().length, routeSeo.length);
  for (const route of routeSeo) {
    const data = routeMetadata(route.path);
    assert.equal(data.alternates.canonical, absoluteUrl(route.path));
    assert.equal(data.openGraph.url, absoluteUrl(route.path));
    assert.match(data.twitter.images[0], /^https:\/\/www\.matrixonline\.in\//);
    assert.doesNotMatch(JSON.stringify(data), /localhost|beta\.simarone\.com/);
  }
});
test("homepage, services and internal pages emit the expected linked data", () => {
  for (const route of routeSeo) {
    const data = pageSchemas(route.path);
    const types = data["@graph"].map(item => item["@type"]);
    if (route.path === "/") { assert.ok(types.includes("Organization")); assert.ok(types.includes("WebSite")); }
    else assert.ok(types.includes("BreadcrumbList"));
    if (["/residential", "/commercial", "/real-estate", "/repair-and-maintenance"].includes(route.path)) assert.ok(types.includes("Service"));
    const faq = data["@graph"].find(item => item["@type"] === "FAQPage");
    if (faq) assert.deepEqual(faq.mainEntity.map(item => item.acceptedAnswer.text), pageAnswers(route.path).map(item => item.answer));
    assert.doesNotMatch(JSON.stringify(data), /localhost|beta\.simarone\.com/);
  }
});
test("closed, hidden and expired jobs cannot receive public job schema", () => {
  for (const change of [{ status: "closed" }, { status: "hidden" }, { isPublic: false }, { hidden: true }, { validThrough: "2000-01-01" }, { validThrough: "invalid" }]) {
    assert.equal(isPublicCareer({ ...role, ...change }), false);
    assert.equal(jobSchema({ ...role, ...change }), null);
  }
});
test("active job schema has required truthful fields, escaped content and a dedicated URL", () => {
  const data = jobSchema(role);
  for (const key of ["title", "description", "datePosted", "hiringOrganization", "jobLocation"]) assert.ok(data[key]);
  assert.equal(data.jobLocation.address.addressCountry, "IN");
  assert.equal(data.employmentType, "FULL_TIME");
  assert.ok(data.description.includes("&lt;safely&gt;"));
  assert.equal(data.url, `https://www.matrixonline.in/career/${role._id}`);
  assert.equal(data.baseSalary, undefined);
  assert.equal(data.validThrough, undefined);
  assert.equal(jobSchema({ ...role, location: "Remote" }), null);
  assert.equal(jobSchema({ ...role, location: "New Delhi" }), null);
  assert.equal(jobSchema({ ...role, createdAt: "bad date" }), null);
  assert.notEqual(careerMetadata(role).title, careerMetadata({ ...role, _id: "1123456789abcdef01234567" }).title);
});
