import type { MetadataRoute } from "next";
import { db, festivals } from "@/db";
import { desc, eq } from "drizzle-orm";
import { AREAS } from "@/lib/regions";
import { THEMES } from "@/lib/themes";

const MIN_MONTHLY_ITEMS = 3;
const MAX_MONTHLY_MONTHS = 18;
const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");
const toAbsoluteUrl = (siteUrl: string, path: string) =>
  new URL(path, `${siteUrl}/`).toString();
const encodePathSegment = (value: string | number) =>
  encodeURIComponent(String(value));

export const revalidate = 3600;

/**
 * Dynamic sitemap.
 * Static pages use the latest festival update time so lastmod stays fresh.
 * Festival pages use each row's updatedAt to avoid identical timestamps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const lastUpdated = await getLatestFestivalUpdatedAt().catch(() => now);
  const siteUrl = SITE_URL;
  const urlWithPath = (path: string) => toAbsoluteUrl(siteUrl, path);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: lastUpdated, changeFrequency: "daily", priority: 1.0 },
    { url: urlWithPath("/weekend"), lastModified: lastUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: urlWithPath("/blog"), lastModified: lastUpdated, changeFrequency: "daily", priority: 0.8 },
    { url: urlWithPath("/plan"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.5 },
    { url: urlWithPath("/regions"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: urlWithPath("/themes"), lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: urlWithPath("/about"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: urlWithPath("/about/curator"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: urlWithPath("/contact"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.4 },
    { url: urlWithPath("/data-policy"), lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.4 },
    { url: urlWithPath("/privacy"), lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: urlWithPath("/terms"), lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3 },
  ];

  let areaPages: MetadataRoute.Sitemap = [];
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

    areaPages = buildAreaPages(rows, now, siteUrl);
    festivalPages = rows.map((festival) => ({
      url: urlWithPath(
        `/festivals/${encodePathSegment(festival.contentId)}/${encodePathSegment(festival.slug)}`,
      ),
      lastModified: festival.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    monthlyAreaPages = buildMonthlyAreaPages(rows, now, siteUrl);
    themePages = buildThemePages(rows, now, siteUrl);
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

function buildAreaPages(
  rows: SitemapFestivalRow[],
  now: Date,
  siteUrl: string,
): MetadataRoute.Sitemap {
  const today = now.toISOString().slice(0, 10);
  const pages: MetadataRoute.Sitemap = [];

  for (const area of AREAS) {
    const matched = rows.filter(
      (row) =>
        row.areaCode === area.code &&
        Boolean(row.endDate) &&
        row.endDate! >= today,
    );

    if (matched.length < MIN_MONTHLY_ITEMS) continue;

    pages.push({
      url: toAbsoluteUrl(siteUrl, `/regions/${area.slug}`),
      lastModified: getLatestUpdatedAt(matched),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return pages;
}

function buildThemePages(
  rows: SitemapFestivalRow[],
  now: Date,
  siteUrl: string,
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
      url: toAbsoluteUrl(siteUrl, `/themes/${theme.slug}`),
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
  siteUrl: string,
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
        url: toAbsoluteUrl(siteUrl, `/monthly/${year}/${month}/${area.slug}`),
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
