import type { MetadataRoute } from "next";
import { db, festivals } from "@/db";
import { eq } from "drizzle-orm";
import { AREAS } from "@/lib/regions";
import { THEMES } from "@/lib/themes";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const MIN_MONTHLY_ITEMS = 3;
const MAX_MONTHLY_MONTHS = 18;
const siteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString();

/**
 * Next.js 동적 sitemap.
 *
 * 정책:
 * - 정적 페이지: 고정 lastmod (배포 시각)
 * - 행사 페이지: festivals.updatedAt (실제 데이터 변경 시각)
 *   → Scaled Content Abuse 검출 회피를 위해 모든 페이지가 같은 시각이 되지 않도록 강제
 * - isIndexable=false 항목은 제외
 *
 * 단일 sitemap이 5만 URL/50MB 초과하면 분할 필요. 현재는 단일로 충분.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: siteUrl("/이번주말"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/지역"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/테마"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/about/curator"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl("/data-policy"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 시도 허브 17개 (URL은 한글 그대로 두되, 클라이언트 호환을 위해 인코딩)
  const areaPages: MetadataRoute.Sitemap = AREAS.map((a) => ({
    url: siteUrl(`/지역/${a.slug}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 행사 상세 페이지 - DB에서 indexable한 항목만
  let festivalPages: MetadataRoute.Sitemap = [];
  let monthlyAreaPages: MetadataRoute.Sitemap = [];
  let themePages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({
        contentId: festivals.contentId,
        slug: festivals.slug,
        areaCode: festivals.areaCode,
        startDate: festivals.startDate,
        endDate: festivals.endDate,
        themesCsv: festivals.themesCsv,
        updatedAt: festivals.updatedAt,
      })
      .from(festivals)
      .where(eq(festivals.isIndexable, true))
      .limit(45_000); // sitemap 한도 보호

    festivalPages = rows.map((f) => ({
      url: siteUrl(`/축제/${f.contentId}/${f.slug}`),
      lastModified: f.updatedAt, // 실제 데이터 변경 시각 (lastmod 분산)
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    monthlyAreaPages = buildMonthlyAreaPages(rows, now);
    themePages = buildThemePages(rows, now);
  } catch {
    // DB 없거나 마이그레이션 전이면 행사 페이지는 건너뜀
  }

  return [
    ...staticPages,
    ...areaPages,
    ...themePages,
    ...monthlyAreaPages,
    ...festivalPages,
  ];
}

type SitemapFestivalRow = {
  areaCode: string | null;
  startDate: string | null;
  endDate: string | null;
  themesCsv: string | null;
  updatedAt: Date;
};

function buildThemePages(
  rows: SitemapFestivalRow[],
  now: Date,
): MetadataRoute.Sitemap {
  const today = now.toISOString().slice(0, 10);
  const pages: MetadataRoute.Sitemap = [];

  for (const theme of THEMES) {
    const matched = rows.filter(
      (row) =>
        Boolean(row.endDate) &&
        row.endDate! >= today &&
        Boolean(row.themesCsv) &&
        row.themesCsv!.includes(`,${theme.name},`),
    );

    if (matched.length < MIN_MONTHLY_ITEMS) continue;

      pages.push({
        url: siteUrl(`/테마/${theme.slug}`),
      lastModified: getLatestUpdatedAt(matched),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return pages;
}

function buildMonthlyAreaPages(
  rows: SitemapFestivalRow[],
  now: Date,
): MetadataRoute.Sitemap {
  const months = getStaticMonths(now, MAX_MONTHLY_MONTHS);
  const pages: MetadataRoute.Sitemap = [];

  for (const { year, month } of months) {
    const { startIso, endIso } = getMonthRange(year, month);

    for (const area of AREAS) {
      const matched = rows.filter((row) =>
        isMonthlyAreaMatch(row, area.code, startIso, endIso),
      );

      if (matched.length < MIN_MONTHLY_ITEMS) continue;

      pages.push({
        url: siteUrl(`/${year}/${month}/${area.slug}`),
        lastModified: getLatestUpdatedAt(matched),
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
  }

  return pages;
}

function isMonthlyAreaMatch(
  row: SitemapFestivalRow,
  areaCode: string,
  startIso: string,
  endIso: string,
) {
  return (
    row.areaCode === areaCode &&
    Boolean(row.startDate) &&
    Boolean(row.endDate) &&
    row.startDate! <= endIso &&
    row.endDate! >= startIso
  );
}

function getLatestUpdatedAt(rows: SitemapFestivalRow[]) {
  return rows.reduce(
    (latest, row) => (row.updatedAt > latest ? row.updatedAt : latest),
    rows[0]?.updatedAt ?? new Date(),
  );
}

function getMonthRange(year: number, month: number) {
  const monthText = String(month).padStart(2, "0");
  const startIso = `${year}-${monthText}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endIso = `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`;

  return { startIso, endIso };
}

function getStaticMonths(start: Date, count: number) {
  const months: Array<{ year: number; month: number }> = [];
  const baseYear = start.getUTCFullYear();
  const baseMonth = start.getUTCMonth();

  for (let offset = 0; offset < count; offset++) {
    const date = new Date(Date.UTC(baseYear, baseMonth + offset, 1));
    months.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
    });
  }

  return months;
}
