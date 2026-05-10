const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

const INDEXNOW_URL = "https://api.indexnow.org/indexnow";
const BING_PING =
  "https://www.bing.com/ping?sitemap=" + encodeURIComponent(`${SITE_URL}/sitemap.xml`);
const GOOGLE_PING =
  "https://www.google.com/ping?sitemap=" + encodeURIComponent(`${SITE_URL}/sitemap.xml`);
const NAVER_INDEXNOW_URL = "https://searchadvisor.naver.com/indexnow";

export async function notifySearchEngines(urls: string[]): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))];
  const target = unique.slice(0, 10_000);

  const jobs = [
    pingIndexnow(target),
    pingSitemapEndpoint(BING_PING),
    pingSitemapEndpoint(GOOGLE_PING),
  ];

  const nav = pingNaverIndexnow(target);
  jobs.push(nav);
  await Promise.allSettled(jobs);
}

export async function pingSitemapEndpoint(url: string): Promise<void> {
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[indexing] ping fail: ${url} (${res.status})`);
    }
  } catch (error) {
    console.warn("[indexing] ping error:", (error as Error).message);
  }
}

export async function pingIndexnow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || urls.length === 0) return;

  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch(INDEXNOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[indexing] indexnow fail: ${res.status}`);
    }
  } catch (error) {
    console.warn("[indexing] indexnow error:", (error as Error).message);
  }
}

export async function pingNaverIndexnow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || urls.length === 0) return;

  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch(NAVER_INDEXNOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[indexing] naver indexnow fail: ${res.status}`);
    }
  } catch (error) {
    console.warn("[indexing] naver indexnow error:", (error as Error).message);
  }
}
