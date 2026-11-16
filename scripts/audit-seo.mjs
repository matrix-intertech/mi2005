import fs from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.SEO_AUDIT_BASE || "http://localhost:3110";
const production = "https://www.matrixonline.in";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const failures = [];
const report = { generatedAt: new Date().toISOString(), base, databaseWrites: false, routes: [], links: [], privateRoutes: [], failures };
const check = (ok, message) => { if (!ok) failures.push(message); };
const url = (path) => new URL(path, base).href;
const page = await context.newPage();
const resources = new Set();
const links = new Set();
try {
  const sitemap = await context.request.get(url("/sitemap.xml"));
  report.sitemapStatus = sitemap.status();
  report.sitemapXml = await sitemap.text();
  check(sitemap.ok(), "Sitemap is unavailable");
  report.sitemap = [...report.sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  check(report.sitemap.length >= 13, "Missing static canonical routes in sitemap");
  check(report.sitemap.every(item => item.startsWith(production) && !/\/(login|dashboard|api)(\/|$)/.test(new URL(item).pathname)), "Unexpected sitemap routes");
  report.robots = await (await context.request.get(url("/robots.txt"))).text();
  check(report.robots.includes(`${production}/sitemap.xml`), "Incorrect robots sitemap");
  check(!/localhost|beta\.simarone\.com/.test(report.sitemapXml + report.robots), "Non-production URL in discovery metadata");
  for (const canonical of report.sitemap) {
    const path = new URL(canonical).pathname;
    const route = { path, layouts: [] };
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(url(path), { waitUntil: "networkidle", timeout: 45000 });
      check(response.status() === 200, `${path}: HTTP ${response.status()}`);
      // Trigger every lazy image, then check actual decoded images and reserved dimensions.
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 650) {
        await page.evaluate(y => scrollTo(0, y), y);
        await page.waitForTimeout(35);
      }
      await page.evaluate(async () => {
        for (const image of document.images) image.loading = "eager";
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      });
      const data = await page.evaluate(() => {
        const meta = (name) => document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.getAttribute("content") || "";
        return {
          title: document.title, description: meta("description"), canonical: document.querySelector('link[rel="canonical"]')?.href,
          canonicals: document.querySelectorAll('link[rel="canonical"]').length,
          h1: [...document.querySelectorAll("h1")].map(e => e.textContent.trim()),
          mainCount: document.querySelectorAll("main").length,
          og: { title: meta("og:title"), description: meta("og:description"), url: meta("og:url"), image: meta("og:image") },
          twitter: { title: meta("twitter:title"), description: meta("twitter:description"), image: meta("twitter:image") },
          robots: meta("robots"),
          schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)),
          links: [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")),
          images: [...document.images].map(i => ({ src: i.getAttribute("src"), alt: i.getAttribute("alt"), decorative: i.getAttribute("aria-hidden") === "true", loaded: i.complete && i.naturalWidth > 0, width: i.getAttribute("width"), height: i.getAttribute("height") })),
          overflow: document.documentElement.scrollWidth > innerWidth,
          faqCount: document.querySelectorAll("#page-questions").length,
          logoIndex: /Logo Index/i.test(document.body.innerText),
        };
      });
      check(data.h1.length === 1 && data.h1[0].length > 3, `${path} ${width}: meaningful single H1`);
      check(data.mainCount === 1, `${path}: main landmark count ${data.mainCount}`);
      check(!data.overflow, `${path} ${width}: horizontal overflow`);
      for (const image of data.images) {
        check(image.loaded, `${path} ${width}: broken image ${image.src}`);
        check(Boolean(image.alt?.trim()) || image.decorative, `${path}: missing alt ${image.src}`);
        check(Number(image.width) > 0 && Number(image.height) > 0, `${path}: missing dimensions ${image.src}`);
        resources.add(image.src);
      }
      route.layouts.push({ width, overflow: data.overflow, images: data.images.length, brokenImages: data.images.filter(i => !i.loaded) });
      if (width === 1440) {
        Object.assign(route, data); delete route.overflow;
        for (const href of data.links) links.add(href);
        check(data.title && data.description, `${path}: missing title/description`);
        check(data.canonical === canonical && data.canonicals === 1, `${path}: incorrect canonical`);
        check(new URL(data.og.url).href === new URL(canonical).href && data.og.title === data.title && data.og.description === data.description, `${path}: incorrect Open Graph metadata`);
        check(data.twitter.title === data.title && data.twitter.description === data.description, `${path}: incorrect Twitter metadata`);
        check([data.og.image, data.twitter.image].every(v => v.startsWith(production + "/")), `${path}: non-production social image`);
        check(!/localhost|beta\.simarone\.com/.test(JSON.stringify([data.title, data.description, data.canonical, data.og, data.twitter, data.schema])), `${path}: forbidden metadata domain`);
        check(!data.robots.includes("noindex"), `${path}: public page noindex`);
        const types = data.schema.flatMap(s => (s["@graph"] || [s]).map(item => item["@type"]));
        route.schemaTypes = types;
        if (path === "/") check(types.includes("Organization") && types.includes("WebSite"), "Homepage schemas missing");
        else check(types.includes("BreadcrumbList"), `${path}: breadcrumb missing`);
        if (["/real-estate", "/repair-and-maintenance", "/residential", "/commercial"].includes(path)) check(types.includes("Service"), `${path}: service schema missing`);
        if (path.startsWith("/career/")) check(types.includes("JobPosting"), `${path}: job schema missing; review actual location/country and required record fields`);
        if (["/", "/process", "/contact-us", "/career", "/real-estate", "/repair-and-maintenance", "/residential", "/commercial"].includes(path)) check(data.faqCount === 1, `${path}: visible answers missing`);
        if (path === "/clients") {
          route.clientLogos = data.images.filter(i => i.src.startsWith("/images/clients/") || i.src.startsWith("/api/portfolio-logos/"));
          check(new Set(route.clientLogos.map(i => i.src)).size === route.clientLogos.length, "Duplicate public client logos");
          check(!data.logoIndex, "Logo Index still exists");
        }
      }
      if (["/", "/clients", "/commercial", "/career"].includes(path)) {
        await page.evaluate(() => scrollTo(0, 0));
        await fs.mkdir(".qa/seo", { recursive: true });
        await page.screenshot({ path: `.qa/seo/${path.slice(1) || "home"}-${width}.png`, fullPage: true });
      }
    }
    report.routes.push(route);
    console.log(`Crawled ${path}: desktop and mobile`);
  }
  for (const key of ["title", "description", "canonical"]) check(new Set(report.routes.map(r => r[key])).size === report.routes.length, `Duplicate ${key}`);
  const reachable = new Set(["/"]);
  for (let pass = 0; pass < report.routes.length; pass++) for (const route of report.routes) if (reachable.has(route.path)) {
    for (const href of route.links) {
      const target = new URL(href, url(route.path));
      if ([new URL(base).origin, production].includes(target.origin)) reachable.add(target.pathname.replace(/\/$/, "") || "/");
    }
  }
  for (const route of report.routes) check(reachable.has(route.path), `Orphan route ${route.path}`);
  for (const href of new Set([...links, ...resources])) {
    if (/^(mailto:|tel:|#)/.test(href)) continue;
    const target = new URL(href, base);
    const isInternal = [new URL(base).origin, production].includes(target.origin);
    try {
      const response = await context.request.get(isInternal ? url(target.pathname + target.search) : target.href, { timeout: 15000 });
      report.links.push({ href, status: response.status(), internal: isInternal });
      check(response.ok(), `Broken ${isInternal ? "internal" : "external"} resource ${href}: ${response.status()}`);
    } catch { report.links.push({ href, status: "unreachable", internal: isInternal }); check(false, `Unreachable resource ${href}`); }
  }
  const dashboard = ["/dashboard", "/dashboard/portfolio", "/dashboard/careers", "/dashboard/careers/new", "/dashboard/careers/0123456789abcdef01234567", "/dashboard/enquiries", "/dashboard/enquiries/0123456789abcdef01234567", "/dashboard/applications", "/dashboard/applications/0123456789abcdef01234567"];
  for (const path of ["/login", ...dashboard]) {
    const response = await context.request.get(url(path), { maxRedirects: 0 });
    const robots = response.headers()["x-robots-tag"];
    report.privateRoutes.push({ path, status: response.status(), robots, location: response.headers().location });
    check(robots?.includes("noindex") && robots?.includes("nofollow"), `${path}: missing indexing header`);
    if (path !== "/login") check([307, 308].includes(response.status()) && response.headers().location === "/login", `${path}: unauthenticated access not blocked`);
  }
  await page.goto(url("/login"));
  check(await page.locator("h1").count() === 1, "Login H1 count");
  check((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex, nofollow"), "Login robots meta");
  const missing = await page.goto(url("/career/0123456789abcdef01234567"));
  report.missingCareer = { status: missing.status(), robots: await page.locator('meta[name="robots"]').evaluateAll(items => items.map(item => item.getAttribute("content"))), schemas: await page.locator('script[type="application/ld+json"]').count() };
  check(await page.locator('meta[name="robots"][content*="noindex"]').count() > 0, "Missing career must be noindex");
  check(report.missingCareer.schemas === 0, "Missing career must not emit job schema");
  if (process.env.QA_ADMIN_EMAIL && process.env.QA_ADMIN_PASSWORD) {
    const login = await context.request.post(url("/api/auth/login"), { form: { email: process.env.QA_ADMIN_EMAIL, password: process.env.QA_ADMIN_PASSWORD } });
    check(login.ok(), "Read-only admin sign-in failed");
    report.authenticated = [];
    for (const path of dashboard.filter(path => !path.includes("0123456789"))) {
      await page.goto(url(path), { waitUntil: "networkidle" });
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      const h1 = await page.locator("h1").allTextContents();
      report.authenticated.push({ path, robots, h1 });
      check(robots.includes("noindex") && robots.includes("nofollow"), `${path}: authenticated noindex missing`);
      check(h1.length === 1, `${path}: H1 count`);
      if (path === "/dashboard/portfolio") { report.adminClientCount = await page.getByRole("article").count(); check(report.adminClientCount === 11, "Expected 11 existing admin clients"); }
    }
  }
} finally {
  await browser.close();
  await fs.mkdir("reports", { recursive: true });
  await fs.writeFile("reports/seo-audit.json", JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ routes: report.routes.length, checkedResources: report.links.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
