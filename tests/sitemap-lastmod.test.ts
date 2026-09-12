import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

function entryFor(source: string, path: string) {
  const marker = `urlWithPath("${path}")`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `entry for ${path} not found`);
  const end = source.indexOf("},", start);
  return source.slice(start, end);
}

test("static info pages do not claim a fake lastmod tied to unrelated festival updates", async () => {
  const source = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );
  for (const path of [
    "/about",
    "/about/curator",
    "/contact",
    "/data-policy",
    "/privacy",
    "/terms",
  ]) {
    assert.doesNotMatch(entryFor(source, path), /lastModified/);
  }
});

test("genuinely dynamic listing pages still report a real lastmod", async () => {
  const source = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );
  for (const path of ["/weekend", "/blog", "/regions", "/themes"]) {
    assert.match(entryFor(source, path), /lastModified: lastUpdated/);
  }
});
