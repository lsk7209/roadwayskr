import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const repoRoot = new URL("../", import.meta.url);

describe("ended festival indexing", () => {
  it("keeps ended detail routes crawlable but noindexed", async () => {
    const page = await readFile(
      new URL("app/festivals/[contentId]/[slug]/page.tsx", repoRoot),
      "utf8",
    );

    assert.match(page, /festival\.status !== "ended"/);
    assert.match(page, /alternates: \{ canonical \}/);
    assert.match(page, /if \(!festival\) return notFound\(\)/);
  });

  it("excludes only ended festivals from the sitemap query", async () => {
    const sitemap = await readFile(new URL("app/sitemap.ts", repoRoot), "utf8");

    assert.match(sitemap, /ne\(festivals\.status, "ended"\)/);
    assert.match(sitemap, /eq\(festivals\.isIndexable, true\)/);
  });
});
