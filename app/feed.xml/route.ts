import type { NextRequest } from "next/server";
import { db, festivals } from "@/db";
import { desc, eq } from "drizzle-orm";

const FEED_TITLE = "RoadWays 축제 리스트";
const FEED_DESCRIPTION =
  "진행 중인 지역 축제 일정과 장소·기간·요약 정보를 빠르게 확인할 수 있습니다.";
const MAX_FEED_ITEMS = 50;

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? "roadways.kr";
  const schemeHeader =
    request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
  const scheme = schemeHeader.replace(":", "");
  const requestHost = `${scheme}://${host}`;

  const items = await db
    .select({
      contentId: festivals.contentId,
      title: festivals.title,
      slug: festivals.slug,
      description: festivals.description,
      overview: festivals.overview,
      startDate: festivals.startDate,
      endDate: festivals.endDate,
      eventPlace: festivals.eventPlace,
      updatedAt: festivals.updatedAt,
    })
    .from(festivals)
    .where(eq(festivals.isIndexable, true))
    .orderBy(desc(festivals.updatedAt))
    .limit(MAX_FEED_ITEMS);

  return new Response(buildRss(items, requestHost), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

type FeedItem = {
  contentId: number;
  title: string;
  slug: string;
  description: string | null;
  overview: string | null;
  startDate: string | null;
  endDate: string | null;
  eventPlace: string | null;
  updatedAt: Date;
};

function buildRss(items: FeedItem[], siteUrl: string) {
  const now = new Date().toUTCString();
  const feedUrl = new URL("/feed.xml", `${siteUrl}/`).toString();
  const escapedFeedLink = escapeXml(feedUrl);
  const rssItems = items.map((item) => toRssItem(item, siteUrl)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <atom:link href="${escapedFeedLink}" rel="self" type="application/rss+xml" />
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
${rssItems}
  </channel>
</rss>
`;
}

function toRssItem(item: FeedItem, siteUrl: string) {
  const link = new URL(
    `/festivals/${item.contentId}/${item.slug}`,
    `${siteUrl}/`,
  ).toString();
  const description = buildDescription(item);

  return `    <item>
      <title>${sanitizeXmlText(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${sanitizeXmlText(description)}</description>
      <pubDate>${item.updatedAt.toUTCString()}</pubDate>
    </item>`;
}

function buildDescription(item: FeedItem) {
  const period = [item.startDate, item.endDate].filter(Boolean).join(" ~ ");
  const summary = item.description ?? item.overview ?? "";
  const parts = [
    period ? `일정: ${period}` : "",
    item.eventPlace ? `장소: ${item.eventPlace}` : "",
    summary,
  ].filter(Boolean);

  return truncate(parts.join(" | "), 240);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function escapeXml(value: string) {
  const safeValue = sanitizeXmlCharacters(value);

  return safeValue.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

function sanitizeXmlText(value: string) {
  return escapeXml(sanitizeXmlCharacters(value));
}

function sanitizeXmlCharacters(value: string) {
  return (
    value
      // XML 1.0 비허용 제어문자 제거 (탭·LF·CR 제외)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      // 론 서로게이트(lone surrogate) 제거 — JS string에서 유효하지 않은 유니코드
      .replace(/[\uD800-\uDFFF]/g, "")
      // XML 비문자(non-character) 제거
      .replace(/[﷐-﷯￾￿]/g, "")
  );
}
