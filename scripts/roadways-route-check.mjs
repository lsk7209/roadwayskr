// Local fixture-only HTTP assertions. Never points at production.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const origin = "http://127.0.0.1:3020";
const rows = [];
async function get(path, expected = 200) {
  const res = await fetch(origin + path, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  rows.push({
    path,
    status: res.status,
    expected,
    location: res.headers.get("location"),
  });
  assert.equal(res.status, expected, path);
  return html;
}
const manifest = JSON.parse(
  await readFile("ddd/04_URL_PROTECTION_MANIFEST.json", "utf8"),
);
for (const route of manifest.protected_routes) await get(route.path);
for (const path of [
  "/festivals/999999999/missing",
  "/monthly/2026/0/서울",
  "/monthly/2026/13/서울",
  "/monthly/notyear/9/서울",
  "/regions/not-a-region",
  "/regions/서울?page=999999",
  "/regions/서울?from=2026-02-30&to=2026-09-20",
])
  await get(path, 404);
for (const path of [
  "/festivals/229054/wrong-slug",
  "/festivals/229054/%25",
  "/regions/서울특별시",
  "/monthly/2026/09/서울",
])
  await get(path, 308);
const parseLd = (html) =>
  [
    ...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]));
const detail = await get("/festivals/229054/229054-지상군페스티벌");
const event = parseLd(detail).find((s) => s["@type"] === "Festival");
assert.equal(event.startDate, "2026-10-01");
assert.equal(event.endDate, "2026-10-05");
assert.equal(event.offers, undefined, "unknown fee must not be zero");
assert.equal(event.location.address.streetAddress, "가상 주소");
assert.ok(!JSON.stringify(event).includes("InStock"));
const listing = await get("/regions/충청남도?from=2026-10-01&to=2026-10-05");
assert.ok(listing.includes("229054"));
assert.ok(listing.includes("2026-10-01"));
assert.ok(listing.includes("2026-10-05"));
const jeju = await get(
  "/festivals/2434545/2434545-새연교-주말-문화공연-금토금토-새연쇼",
  308,
);
void jeju;
const multiAlias = await fetch(origin + "/festivals/2809535/placeholder", {
  redirect: "manual",
});
const multi = await get(multiAlias.headers.get("location"));
assert.ok(
  !parseLd(multi).some((s) => s["@type"] === "Festival"),
  "multi-program guide must not invent a single Event",
);
assert.ok(multi.includes("종로 54"));
assert.ok(multi.includes("예장동 8-1"));
assert.ok(multi.includes("취소"));
const sitemap = await get("/sitemap.xml");
assert.ok(sitemap.includes("<urlset"));
assert.ok(!sitemap.includes("/plan<"));
const robots = await get("/robots.txt");
assert.ok(!/Disallow: \/_next\//.test(robots));
await writeFile(
  "docs/roadways/improvement-20260920/http-checks.json",
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      origin,
      database: "isolated local fixture; two protected IDs are synthetic",
      checks: rows,
      schema: "PASS local parse and fields; external validator NOT_RUN",
    },
    null,
    2,
  ),
);
console.log(
  `PASS ${rows.length} HTTP checks; date/card parity, schema fields and multi-program omission`,
);
