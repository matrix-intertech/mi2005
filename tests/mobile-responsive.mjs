import assert from "node:assert/strict";
import { webkit } from "playwright";

// Run against a running local preview: node tests/mobile-responsive.mjs
const baseURL = process.env.RESPONSIVE_BASE_URL || "http://localhost:3000";
const sizes = [[320,568],[360,800],[375,812],[390,844],[393,852],[402,874],[430,932],[768,1024],[1440,900]];
const browser = await webkit.launch({ headless: true });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto(baseURL, { waitUntil: "load" });
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector(".home-hero");
      const content = document.querySelector(".home-hero-content");
      const rect = hero.getBoundingClientRect();
      const text = content.getBoundingClientRect();
      const buttons = [...document.querySelectorAll(".home-hero-actions a")].map(el => el.getBoundingClientRect().height);
      const logo = document.querySelector(".site-header-layout > a").getBoundingClientRect();
      const menu = document.querySelector(".mobile-menu").getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: text.top < rect.top || text.bottom > rect.bottom,
        bottomSpace: rect.bottom - text.bottom,
        heroHeight: rect.height,
        buttons,
        headerOverlap: innerWidth < 640 && logo.right > menu.left,
        columns: getComputedStyle(hero.nextElementSibling.firstElementChild).gridTemplateColumns.split(" ").length,
        viewport: document.querySelector('meta[name="viewport"]').content,
      };
    });
    assert.equal(metrics.overflow, false, `${width}: horizontal overflow`);
    assert.equal(metrics.clipped, false, `${width}: hero text clipped`);
    assert.equal(metrics.headerOverlap, false, `${width}: header overlap`);
    assert.equal(metrics.columns, width < 640 ? 2 : 4, `${width}: statistics columns`);
    assert.match(metrics.viewport, /width=device-width/);
    assert.match(metrics.viewport, /initial-scale=1/);
    assert.match(metrics.viewport, /viewport-fit=cover/);
    assert.ok(metrics.buttons.every(h => h >= 44), `${width}: button touch size`);
    if (width < 640) {
      assert.ok(metrics.bottomSpace >= 48, `${width}: hero bottom clearance`);
      assert.ok(metrics.heroHeight <= 700, `${width}: hero too tall`);
      await page.locator('summary[aria-controls="mobile-navigation"]').click();
      const menu = await page.locator("#mobile-navigation").evaluate(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });
      assert.ok(menu.left >= 0 && menu.right <= width, `${width}: menu overflow`);
      await page.getByRole("link", { name: "Start enquiry", exact: true }).filter({ visible: true }).waitFor();
    }
    console.log(`PASS WebKit ${width}x${height}`);
  }
} finally {
  await browser.close();
}
