import assert from "node:assert/strict";
import { test } from "node:test";
import { access, readFile } from "node:fs/promises";

test("home and blog pages no longer contain reviewer/crawler-facing language", async () => {
  for (const path of ["../app/page.tsx", "../app/blog/page.tsx"]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /adsense review/i);
    assert.doesNotMatch(source, /thin-page/i);
    assert.doesNotMatch(source, /doorway/i);
    assert.doesNotMatch(source, /crawlable/i);
  }
});

test("/plan public route no longer exists", async () => {
  await assert.rejects(() =>
    access(new URL("../app/plan/page.tsx", import.meta.url)),
  );
});

test("sitemap and public pages no longer reference /plan", async () => {
  for (const path of [
    "../app/sitemap.ts",
    "../app/page.tsx",
    "../app/about/page.tsx",
    "../app/contact/page.tsx",
  ]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\/plan/);
  }
});

test("robots.ts no longer blocks the real /_next/ asset path", async () => {
  const source = await readFile(
    new URL("../app/robots.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /["'`]\/_next\/["'`]/);
});
