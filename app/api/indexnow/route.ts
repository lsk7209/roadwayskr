import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

const ENDPOINTS = [
  "https://searchadvisor.naver.com/indexnow",
  "https://www.bing.com/indexnow",
];

export async function POST(req: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { error: "INDEXNOW_KEY not set" },
      { status: 500 },
    );
  }

  let urls: string[];
  try {
    const body = await req.json();
    urls = Array.isArray(body.urls) ? body.urls : [body.url];
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!urls.length || urls.some((u) => typeof u !== "string")) {
    return NextResponse.json({ error: "urls required" }, { status: 400 });
  }

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const results = await Promise.allSettled(
    ENDPOINTS.map((endpoint) =>
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      }),
    ),
  );

  const statuses = results.map((r, i) => ({
    endpoint: ENDPOINTS[i],
    ok: r.status === "fulfilled" && r.value.ok,
  }));

  return NextResponse.json({ submitted: urls, statuses });
}
