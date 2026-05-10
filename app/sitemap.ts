import type { MetadataRoute } from "next";
import { db, festivals } from "@/db";
import { desc, eq } from "drizzle-orm";
import { AREAS } from "@/lib/regions";
import { THEMES } from "@/lib/themes";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const MIN_MONTHLY_ITEMS = 3;
const MAX_MONTHLY_MONTHS = 18;
const siteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString();

export const revalidate = 3600;

/**
 * Dynamic sitemap.
 * Static pages use the latest festival update time so lastmod stays fresh.
 * Festival pages use each row's updatedAt to avoid identical timestamps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const lastUpdated = await getLatestFestivalUpdatedAt().catch(() => now);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: lastUpdated, changeFrequency: "daily", priority: 1.0 },
    { url: siteUrl("/weekend"), lastModified: lastUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/plan"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.5 },
    { url: siteUrl("/regions"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/themes"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/about"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/about/curator"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/contact"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl("/data-policy"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl("/privacy"), lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/terms"), lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3 },
  ];

  const areaPages: MetadataRoute.Sitemap = AREAS.map((area) => ({
    url: siteUrl(`/regions/${area.slug}`),
    lastModified: lastUpdated,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

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
      .limit(45_000);

    festivalPages = rows.map((festival) => ({
      url: siteUrl(`/festivals/${festival.contentId}/${festival.slug}`),
      lastModified: festival.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    monthlyAreaPages = buildMonthlyAreaPages(rows, now);
    themePages = buildThemePages(rows, now);
  } catch {
    // Skip dynamic sitemap sections before DB setup or migration.
  }

  return [
    ...staticPages,
    ...areaPages,
    ...themePages,
    ...monthlyAreaPages,
    ...festivalPages,
  ];
}

async function getLatestFestivalUpdatedAt() {
  const rows = await db
    .select({ updatedAt: festivals.updatedAt })
    .from(festivals)
    .where(eq(festivals.isIndexable, true))
    .orderBy(desc(festivals.updatedAt))
    .limit(1);

  return rows[0]?.updatedAt ?? new Date();
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
      url: siteUrl(`/themes/${theme.slug}`),
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
