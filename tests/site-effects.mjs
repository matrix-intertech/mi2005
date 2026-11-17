import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { webkit } from "playwright";

const base = process.env.RESPONSIVE_BASE_URL || "http://localhost:3000";
const browser = await webkit.launch();
const output = ".qa/performance/regression";
await fs.mkdir(output, { recursive: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [360, 375, 390, 393, 430, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    const images = [];
    const track = response => { if (response.url().includes("hero-studio") && response.request().resourceType() === "image") images.push(response.url()); };
    page.on("response", track);
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector(".home-hero");
      const rect = hero.getBoundingClientRect();
      const text = document.querySelector(".home-hero-content").getBoundingClientRect();
      const image = hero.querySelector("img");
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: text.top < rect.top || text.bottom > rect.bottom,
        loaded: image.complete && image.naturalWidth > 0,
        src: image.currentSrc,
        keywords: document.querySelectorAll('meta[name="keywords"]').length,
        h1: document.querySelectorAll("h1").length,
      };
    });
    assert.equal(await page.locator("[data-reveal-state]").count(), 0, "Reveal scanning waits for interaction");
    assert.equal(metrics.overflow, false, `${width}: overflow`);
    assert.equal(metrics.clipped, false, `${width}: hero clipping`);
    assert.equal(metrics.loaded, true, `${width}: hero image`);
    assert.equal(metrics.h1, 1);
    assert.equal(metrics.keywords, 0);
    if (width <= 480) assert.match(metrics.src, /hero-studio-mobile-/);
    else if (width < 640) assert.match(metrics.src, /hero-studio-mobilewide-/);
    else if (width === 768) assert.match(metrics.src, /hero-studio-tablet-/);
    else assert.match(metrics.src, /hero-studio-1800-/);
    assert.equal(new Set(images).size, 1, `${width}: duplicate hero downloads`);
    page.off("response", track);
    if ([390,1440].includes(width)) await page.screenshot({ path: `${output}/home-${width}.png` });
    if (width === 390) {
      await page.locator('summary[aria-controls="mobile-navigation"]').click();
      assert.ok(await page.getByRole("link", { name: "Start enquiry", exact: true }).filter({ visible: true }).isVisible());
      await page.locator('summary[aria-controls="mobile-navigation"]').click();
      const pending = page.locator('[data-reveal-state="pending"]').first();
      assert.ok(await pending.count(), "Below-fold entrance effects were not registered");
      await pending.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('[data-reveal-state="visible"]'));
      assert.ok(await page.locator('[data-reveal-state="visible"]').count());
      const layer = page.locator("[data-parallax]").first();
      const before = await layer.getAttribute("style");
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(100);
      assert.equal(await layer.getAttribute("style"), before, "Mobile parallax must stay inactive");
    }
    if (width >= 1024) {
      const layer = page.locator("[data-parallax]").first();
      assert.equal(await layer.getAttribute("style"), null, "No parallax work before scrolling");
      await page.evaluate(() => scrollTo(0, 250));
      await page.waitForFunction(() => document.querySelector("[data-parallax]").style.getPropertyValue("--parallax-y"));
      assert.ok(await layer.getAttribute("style"), "Desktop parallax responds to scroll");
    }
    console.log(`PASS normal-motion WebKit ${width}`);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".parallax-layer").first().evaluate(el => getComputedStyle(el).transform), "none");
  assert.equal(await page.locator('[data-reveal-state="pending"]').count(), 0);
  console.log("PASS reduced motion");

  await page.route("**/api/enquiry", route => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await page.goto(`${base}/contact-us`, { waitUntil: "networkidle" });
  await page.getByLabel("Name", { exact: true }).fill("Local QA");
  await page.getByLabel("Email", { exact: true }).fill("qa@example.invalid");
  await page.getByLabel("Project brief", { exact: true }).fill("Intercepted browser test; no database write or email.");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page.getByRole("status").filter({ hasText: "Thank you" }).waitFor();
  assert.equal(await page.getByLabel("Name", { exact: true }).inputValue(), "");
  console.log("PASS enquiry UI with intercepted API; no SMTP or database writes");
  assert.deepEqual(errors, []);

  // Logo fallback must work without hydrating each logo, including reduced motion.
  await page.goto(base, { waitUntil: "load" });
  const logo = page.locator("[data-logo-image]").first();
  if (await logo.count()) {
    const src = await logo.getAttribute("src");
    await page.route(`**${src}`, route => route.abort());
    await page.reload({ waitUntil: "load" });
    await page.locator("[data-logo-image]").first().evaluate(el => el.parentElement.parentElement.scrollIntoView({ block: "center" }));
    await page.waitForFunction(() => {
      const image = document.querySelector("[data-logo-image]");
      return image.hidden && !image.closest("[data-client-logo]").querySelector("[data-logo-fallback]").hidden;
    });
    console.log("PASS server-rendered client logo fallback with reduced motion");
    await page.unroute(`**${src}`);
    const recovered = new URL(src, base); recovered.searchParams.set("qa-recovery", "1");
    await page.locator("[data-logo-image]").first().evaluate((image, url) => { image.src = url; }, recovered.href);
    await page.waitForFunction(() => {
      const image = document.querySelector("[data-logo-image]");
      return image.complete && image.naturalWidth > 0 && !image.hidden && image.closest("[data-client-logo]").querySelector("[data-logo-fallback]").hidden;
    }, undefined, { timeout: 5000 });
    console.log("PASS client logo recovery after a corrected image source");
  }

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await noJS.newPage(); await plain.goto(base, { waitUntil: "domcontentloaded" });
  const visible = await plain.locator(".home-hero-content > div").evaluateAll(elements => elements.every(el => {
    const css = getComputedStyle(el);
    return css.opacity === "1" && css.visibility === "visible" && css.animationName === "none" && css.transform === "none";
  }));
  assert.equal(visible, true, "Every hero text/button wrapper is visible immediately, without JS or animations");
  assert.equal(await plain.locator(".home-hero + section [data-reveal]").count(), 0, "Stats must not wait for reveal observers");
  assert.ok(await plain.locator("h1").isVisible());
  assert.equal(await plain.locator(".home-hero img").evaluate(el => el.complete && el.naturalWidth > 0), true);
  console.log("PASS server-rendered hero without JavaScript");
  await noJS.close();
} finally {
  await browser.close();
}
