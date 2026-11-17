import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

const manifest = JSON.parse(await fs.readFile("lib/responsive-images.json", "utf8"));
test("responsive images retain aspect ratios, declared sizes and content hashes", async () => {
  for (const [original, image] of Object.entries(manifest)) {
    const source = await sharp(`public${original}`).metadata();
    assert.equal(source.width, image.width);
    assert.equal(source.height, image.height);
    assert.ok(image.variants.some(v => v.format === "avif"));
    assert.ok(image.variants.some(v => v.format === "webp"));
    for (const variant of [...image.variants, ...image.mobile, ...image.mobileWide, ...image.tablet]) {
      const bytes = await fs.readFile(`public${variant.src}`);
      const info = await sharp(bytes).metadata();
      assert.equal(bytes.length, variant.bytes);
      assert.equal(info.width, variant.width);
      assert.ok(variant.src.includes(crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12)));
      const expectedHeight = image.mobile.includes(variant) ? info.width / .75 : [...image.mobileWide, ...image.tablet].includes(variant) ? info.width / 1.25 : info.width * image.height / image.width;
      assert.ok(Math.abs(info.height - expectedHeight) <= 1, `${variant.src}: aspect ratio`);
    }
  }
});
