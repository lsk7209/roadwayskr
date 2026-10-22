import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

const ENDPOINTS = [
  "https://searchadvisor.naver.com/indexnow",
  "https://www.bing.com/indexnow",
];

/** Internal operational cap, independent of IndexNow's own 10,000 URL limit. */
const MAX_URLS = 1_000;
const MAX_URL_LENGTH = 2_048;
/** Hard cap on request body size read, regardless of Content-Length header. */
const MAX_BODY_BYTES = 256 * 1024;
const FETCH_TIMEOUT_MS = 8_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function isRateLimited(req: Request, now = Date.now()): boolean {
  if (ipRateLimitMap.size > 1_000) {
    for (const [key, entry] of ipRateLimitMap) {
      if (now >= entry.resetAt) {
        ipRateLimitMap.delete(key);
      }
    }
  }

  const ip = getClientIp(req);
  const existing = ipRateLimitMap.get(ip);
  if (!existing || now >= existing.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

async function readBodyWithLimit(req: Request): Promise<string> {
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("body too large");
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}

function isAllowedUrl(candidate: string, siteOrigin: URL): boolean {
  if (candidate.length > MAX_URL_LENGTH) return false;
  // Reject protocol-relative and userinfo-bearing inputs before parsing.
  if (candidate.startsWith("//") || candidate.includes("@")) return false;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.hostname !== siteOrigin.hostname) return false;
  if (parsed.port !== siteOrigin.port) return false;
  if (parsed.username || parsed.password) return false;
  // Never notify search engines about internal/admin/API surfaces.
  if (/^\/(api|admin)(\/|$)/.test(parsed.pathname)) return false;
  return true;
}

async function fetchWithTimeout(url: string, body: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
      signal: ctrl.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  if (isRateLimited(req)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  // Authentication is checked before any body parsing or outbound request.
  // Unauthenticated callers must trigger zero external fetches.
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { status: "disabled", reason: "missing_configuration" },
      { status: 503 },
    );
  }

  let siteOrigin: URL;
  try {
    siteOrigin = new URL(SITE_URL);
  } catch {
    return NextResponse.json(
      { status: "disabled", reason: "invalid_site_url" },
      { status: 500 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await readBodyWithLimit(req);
  } catch {
    return NextResponse.json({ error: "body too large" }, { status: 413 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const body = parsedBody as { urls?: unknown; url?: unknown };
  const candidates = Array.isArray(body.urls)
    ? body.urls
    : typeof body.url === "string"
      ? [body.url]
      : [];

  if (!candidates.length || candidates.some((u) => typeof u !== "string")) {
    return NextResponse.json({ error: "urls required" }, { status: 400 });
  }

  if (candidates.length > MAX_URLS) {
    return NextResponse.json(
      { error: `too many urls (max ${MAX_URLS})` },
      { status: 413 },
    );
  }

  // De-duplicate, drop empty strings, then validate each remaining candidate.
  const deduped = [...new Set((candidates as string[]).filter(Boolean))];
  const urls = deduped.filter((u) => isAllowedUrl(u, siteOrigin));
  const rejected = deduped.length - urls.length;

  if (!urls.length) {
    return NextResponse.json(
      { error: "no valid same-origin https urls" },
      { status: 400 },
    );
  }

  const payload = {
    host: siteOrigin.hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };
  const body_ = JSON.stringify(payload);

  const results = await Promise.all(
    ENDPOINTS.map((endpoint) => fetchWithTimeout(endpoint, body_)),
  );

  const statuses = results.map((r, i) => ({
    endpoint: ENDPOINTS[i],
    // A 2xx response means the provider accepted the notification for
    // processing, not that the URLs have been crawled or indexed.
    result: r.ok
      ? "accepted_pending_validation"
      : r.status
        ? "failed"
        : "failed",
    status: r.status,
  }));

  return NextResponse.json({
    status: "submitted",
    submittedCount: urls.length,
    rejectedCount: rejected,
    statuses,
  });
}
