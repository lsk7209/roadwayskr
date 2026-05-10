import { db, festivals } from "@/db";
import { desc, eq } from "drizzle-orm";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const FEED_TITLE = "여행고고 최신 축제";
const FEED_DESCRIPTION = "전국에서 열리는 최신 축제와 행사 정보를 모아 전합니다.";
const MAX_FEED_ITEMS = 50;

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET() {
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

  return new Response(buildRss(items), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
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

function buildRss(items: FeedItem[]) {
  const now = new Date().toUTCString();
  const rssItems = items.map(toRssItem).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
${rssItems}
  </channel>
</rss>
`;
}

function toRssItem(item: FeedItem) {
  const link = new URL(`/축제/${item.contentId}/${item.slug}`, `${SITE_URL}/`).toString();
  const description = buildDescription(item);

  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${item.updatedAt.toUTCString()}</pubDate>
    </item>
`;
}

function buildDescription(item: FeedItem) {
  const period = [item.startDate, item.endDate].filter(Boolean).join(" ~ ");
  const summary = item.description ?? item.overview ?? "";
  const parts = [
    period ? `기간: ${period}` : "",
    item.eventPlace ? `장소: ${item.eventPlace}` : "",
    summary,
  ].filter(Boolean);

  return truncate(parts.join(" | "), 240);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case "\"":
        return "&quot;";
      default:
        return char;
    }
  });
}
