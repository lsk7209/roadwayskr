// Read-only HTML observations: never executes ads, analytics, or page scripts.
import { readFile, writeFile } from "node:fs/promises";
const manifest = JSON.parse(
  await readFile("ddd/04_URL_PROTECTION_MANIFEST.json", "utf8"),
);
const origin = process.argv[2] ?? "https://roadways.kr";
const output =
  process.argv[3] ?? "docs/roadways/improvement-20260920/public-before.json";
const paths = [
  ...manifest.protected_routes.map((r) => r.path),
  "/blog",
  "/regions",
  "/regions/서울",
  "/weekend",
];
const results = [];
for (const path of paths) {
  try {
    const res = await fetch(new URL(path, origin), {
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const tag = (pattern) => html.match(pattern)?.[1] ?? null;
    results.push({
      path,
      observedAt: new Date().toISOString(),
      status: res.status,
      finalUrl: res.url,
      title: tag(/<title>([\s\S]*?)<\/title>/),
      canonical: tag(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/),
      robots: [
        ...html.matchAll(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/g),
      ].map((m) => m[1]),
      robotsHeader: res.headers.get("x-robots-tag"),
      h1: tag(/<h1[^>]*>([\s\S]*?)<\/h1>/),
      cards: [...html.matchAll(/href="(\/festivals\/[^"?]+)[^"]*"/g)]
        .map((m) => m[1])
        .filter((v, i, a) => a.indexOf(v) === i),
      autoAdsScript: /<script[^>]+src="[^"]*adsbygoogle/.test(html),
      actualAds: "UNKNOWN (HTML only)",
      text: html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 18000),
    });
    console.log(`${res.status} ${path}`);
  } catch (err) {
    results.push({ path, error: err.message, status: "UNKNOWN" });
    console.log(`UNKNOWN ${path}`);
  }
}
await writeFile(output, JSON.stringify({ origin, results }, null, 2));
