// Local HTTP proof against the source snapshot plus the explicit three-row plan.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const directory = "docs/roadways/improvement-20260920/";
const read = async path => JSON.parse(await readFile(path, "utf8"));
const publicBefore = await read(directory + "public-continuation.json");
const localBefore = await read(directory + "local-production-parity.json");
const manifest = await read("ddd/04_URL_PROTECTION_MANIFEST.json");
const snapshot = await read(".goal-harness/private/production-20260920.json");
const simulation = await read(directory + "repair-simulation.json");
const rows = snapshot.rows.map(row => ({...row, ...(simulation.changes.find(c => c.contentId === row.content_id)?.after ?? {})}));
const checks = [];
const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push({name, pass:true}); };
const origin = "http://127.0.0.1:3020";
const get = async path => { const res = await fetch(origin + path, {signal:AbortSignal.timeout(15000)}); assert.equal(res.status, 200, path); return res.text(); };
const jsonLd = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
for (const {path} of manifest.protected_routes) {
  const before = publicBefore.results.find(r => r.path === path);
  const local = localBefore.results.find(r => r.path === path);
  check("same-data status/canonical/robots " + path, [local.status,local.canonical,local.robots], [before.status,before.canonical,before.robots]);
  const html = await get(path);
  check("repaired canonical " + path, html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1], before.canonical);
}
const today = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
for (const range of [null, {from:"2026-09-19",to:"2026-09-20"}]) {
  const expected = rows.filter(r => r.area_code === "1" && r.is_indexable === 1 && (range ? r.status !== "cancelled" && r.start_date && r.start_date <= range.to && r.end_date >= range.from : ["ongoing","upcoming"].includes(r.status) && r.end_date >= today)).sort((a,b) => a.start_date.localeCompare(b.start_date) || a.content_id - b.content_id).map(r => r.content_id);
  const found = [];
  for (let page=1; page<=Math.max(1,Math.ceil(expected.length/24)); page++) {
    const q = new URLSearchParams(range ?? {}); if (page>1) q.set("page", String(page));
    const html = await get("/regions/서울" + (q.size ? "?"+q : ""));
    const collection = jsonLd(html).find(r => r["@type"] === "CollectionPage");
    const ids = collection.mainEntity.itemListElement.map(r => Number(new URL(r.url).pathname.split("/")[2]));
    check(`Seoul ${range ? "weekend" : "current"} page ${page} ordered IDs`, ids, expected.slice((page-1)*24,page*24));
    found.push(...ids);
  }
  check(`Seoul ${range ? "weekend" : "current"} no missing/duplicate cards`, found, expected);
}
for (const change of simulation.changes) {
  const row = rows.find(r => r.content_id === change.contentId);
  const html = await get(`/festivals/${row.content_id}/${encodeURIComponent(row.slug)}`);
  const event = jsonLd(html).find(r => r["@type"] === "Festival");
  check(`${row.content_id} schema date range`, [event?.startDate,event?.endDate], [row.start_date,row.end_date]);
  assert.ok(html.includes(row.event_place));
  checks.push({name:`${row.content_id} official venue present`,pass:true});
  if (row.content_id !== 229054) check(`${row.content_id} unknown fee omitted`, event?.offers, undefined);
  if (row.content_id === 3000221) {
    check("obsolete Eunpyeong coordinate removed", html.includes("126.929352269"), false);
    check("Eunpyeong ended detail is noindex", /name="robots" content="noindex, follow"/.test(html), true);
  }
}
await writeFile(directory + "parity-checks.json", JSON.stringify({observedAt:new Date().toISOString(),origin,dataset:"864 production rows; 3 reviewed LOCAL repairs; no production writes",checks},null,2));
console.log(`PASS ${checks.length} same-data/repair HTTP assertions`);
