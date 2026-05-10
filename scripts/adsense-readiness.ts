import { AREAS } from "../lib/regions";
import { THEMES } from "../lib/themes";

/**
 * AdSense + SEO readiness check
 * Usage: pnpm adsense:check
 */
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const SITEMAP_FRESH_DAYS = 7;

interface Check {
  id: number;
  name: string;
  status: "pass" | "warn" | "fail" | "skip";
  detail?: string;
}

type Freshness = "fresh" | "warn" | "fail";

function isSuccessful(status: number) {
  return [200, 301, 302, 307, 308].includes(status);
}

function isTextKoreanEnough(text: string) {
  const plain = text.replace(/<[^>]*>/g, " ");
  return (plain.match(/[\uAC00-\uD7A3]/g) || []).length >= 12;
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const target = resolveCheckUrl(path);
  try {
    const res = await fetch(target, {
      headers: { "User-Agent": "AdsenseReadinessCheck/1.0" },
    });
    return { status: res.status, html: await res.text().catch(() => "") };
  } catch {
    return { status: 0, html: "" };
  }
}

function resolveCheckUrl(path: string) {
  if (!/^https?:\/\//i.test(path)) {
    return `${SITE_URL}${path}`;
  }

  const current = new URL(SITE_URL);
  const target = new URL(path);
  if (isLocalHost(current.hostname) && target.hostname !== current.hostname) {
    target.protocol = current.protocol;
    target.host = current.host;
  }

  return target.toString();
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function has(html: string, regex: RegExp): boolean {
  return regex.test(html);
}

function getSitemapFreshness(lastmods: number[]): Freshness {
  if (lastmods.length === 0) return "warn";
  const latest = Math.max(...lastmods);
  const ageDays = Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24));
  if (ageDays <= SITEMAP_FRESH_DAYS) return "fresh";
  if (ageDays <= 60) return "warn";
  return "fail";
}

function parseLastmods(sitemapXml: string) {
  return [...sitemapXml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)]
    .map((m) => Date.parse(m[1]))
    .filter(Number.isFinite);
}

function findFestivalUrl(sitemapXml: string): string | null {
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const hasFestivalPath = (value: string) => {
    const decoded = (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })();

    return (
      decoded.includes("/festivals/") ||
      decoded.includes("/축제/") ||
      decoded.includes("/%EC%B6%95%EC%A0%9C/")
    );
  };

  return locs.find((loc) => hasFestivalPath(loc)) ?? null;
}

async function main() {
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  for (const [id, path] of [
    [1, "/"],
    [2, "/about"],
    [3, "/about/curator"],
    [4, "/contact"],
    [5, "/data-policy"],
    [6, "/privacy"],
    [7, "/terms"],
  ] as const) {
    const { status } = await fetchHtml(path);
    add({
      id,
      name: `Page response: ${path}`,
      status: isSuccessful(status) ? "pass" : "fail",
      detail: `HTTP ${status}`,
    });
  }

  {
    const { status } = await fetchHtml("/robots.txt");
    add({ id: 8, name: "robots.txt", status: status === 200 ? "pass" : "fail", detail: `HTTP ${status}` });
  }
  {
    const { status, html } = await fetchHtml("/sitemap.xml");
    add({ id: 9, name: "sitemap.xml", status: status === 200 && html.includes("<urlset") ? "pass" : "fail", detail: `HTTP ${status}` });
  }
  {
    const { status } = await fetchHtml("/__definitely_not_a_page__");
    add({ id: 10, name: "404 page", status: status === 404 ? "pass" : "fail", detail: `HTTP ${status}` });
  }

  {
    const sampleArea = AREAS[0]?.slug ?? "gyeonggi";
    const sampleTheme = THEMES[0]?.slug ?? "family";
    const now = new Date();
    const sampleMonthPath = `/${now.getFullYear()}/${now.getMonth() + 1}/${sampleArea}`;
    const menuPages = ["/weekend", `/regions/${sampleArea}`, `/themes/${sampleTheme}`, sampleMonthPath];
    for (const [idx, path] of menuPages.entries()) {
      const { status } = await fetchHtml(path);
      add({ id: 11 + idx, name: `Menu path check: ${path}`, status: isSuccessful(status) ? "pass" : status === 0 ? "warn" : "fail", detail: `HTTP ${status}` });
    }
    add({ id: 15, name: "Plan page", status: isSuccessful((await fetchHtml("/plan")).status) ? "pass" : "warn", detail: "GET /plan" });
  }

  const home = await fetchHtml("/");
  add({ id: 16, name: "<html lang=\"ko-KR\">", status: has(home.html, /<html[^>]*lang=["']ko-KR["']/i) ? "pass" : "fail" });
  add({ id: 17, name: "meta description", status: has(home.html, /<meta[^>]*name=["']description["']/i) ? "pass" : "fail" });
  add({ id: 18, name: "canonical link", status: has(home.html, /<link[^>]*rel=["']canonical["']/i) ? "pass" : "fail" });
  add({ id: 19, name: "OG tag", status: has(home.html, /property=["']og:title["']/i) ? "pass" : "fail" });
  add({ id: 20, name: "viewport", status: has(home.html, /<meta[^>]*name=["']viewport["']/i) ? "pass" : "fail" });
  add({ id: 21, name: "Organization schema", status: has(home.html, /\"@type\"\s*:\s*\"Organization\"/i) ? "pass" : "fail" });
  add({ id: 22, name: "WebSite schema", status: has(home.html, /\"@type\"\s*:\s*\"WebSite\"/i) ? "pass" : "fail" });
  add({ id: 23, name: "AdSense script", status: has(home.html, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js|adsbygoogle/i) ? "pass" : "warn" });
  add({ id: 24, name: "h1 tag", status: /<h1[^>]*>.*?<\/h1>/is.test(home.html) ? "pass" : "fail" });
  add({ id: 25, name: "Korean text", status: isTextKoreanEnough(home.html) ? "pass" : "warn" });

  {
    const curator = await fetchHtml("/about/curator");
    add({ id: 26, name: "Person schema", status: has(curator.html, /\"@type\"\s*:\s*\"Person\"/i) ? "pass" : "fail" });
  }
  add({
    id: 27,
    name: "HTTPS",
    status: SITE_URL.startsWith("https://")
      ? "pass"
      : isLocalHost(new URL(SITE_URL).hostname)
        ? "skip"
        : "fail",
  });

  {
    const { status, html } = await fetchHtml("/ads.txt");
    const ok = status === 200 && /google\.com,\s*(?:ca-pub-|pub-)\d{16}/i.test(html);
    add({ id: 28, name: "ads.txt", status: ok ? "pass" : status === 200 ? "warn" : "warn", detail: `HTTP ${status}` });
  }

  {
    const { html } = await fetchHtml("/sitemap.xml");
    const lastmods = parseLastmods(html);
    const freshness = getSitemapFreshness(lastmods);
    add({
      id: 29,
      name: "sitemap lastmod freshness",
      status: freshness === "fresh" ? "pass" : freshness,
      detail: lastmods.length ? `latest: ${freshness}` : "missing lastmod",
    });
  }
  add({ id: 30, name: "IndexNow key", status: process.env.INDEXNOW_KEY ? "pass" : "warn", detail: process.env.INDEXNOW_KEY ? "set" : "missing" });

  const { html: sitemapXml } = await fetchHtml("/sitemap.xml");
  const sample = findFestivalUrl(sitemapXml);
  if (!sample) {
    add({ id: 31, name: "sample festival page", status: "skip", detail: "no festival url in sitemap" });
    add({ id: 32, name: "sample page metadata", status: "skip", detail: "no sample page" });
  } else {
    const { status, html } = await fetchHtml(sample);
    add({ id: 31, name: "sample festival page", status: status === 200 ? "pass" : status === 0 ? "warn" : "fail", detail: `HTTP ${status}` });
    add({ id: 32, name: "sample festival schema", status: has(html, /\"@type\"\s*:\s*\"Festival\"/i) ? "pass" : "warn" });
  }

  const icon = (status: Check["status"]) =>
    status === "pass" ? "[PASS]" : status === "warn" ? "[WARN]" : status === "fail" ? "[FAIL]" : "[SKIP]";

  console.log(`\n=== AdSense / SEO Readiness (${SITE_URL}) ===`);
  for (const c of checks.sort((a, b) => a.id - b.id)) {
    const detail = c.detail ? ` (${c.detail})` : "";
    console.log(`${icon(c.status)} #${String(c.id).padStart(2, "0")} ${c.name}${detail}`);
  }

  const pass = checks.filter((c) => c.status === "pass").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const skip = checks.filter((c) => c.status === "skip").length;
  console.log(`\nTotal: ${checks.length}, pass ${pass}, warn ${warn}, fail ${fail}, skip ${skip}`);

  if (fail > 0) {
    console.log("Found fail. Fix required.");
    process.exit(1);
  }
  if (warn > 0) {
    console.log("Warnings detected. Improvement recommended.");
  } else {
    console.log("No fail detected.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
