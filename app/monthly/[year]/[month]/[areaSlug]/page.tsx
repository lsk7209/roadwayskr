import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { AREAS, findAreaBySlug } from "@/lib/regions";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

export const revalidate = 3600;

interface Params {
  params: Promise<{ year: string; month: string; areaSlug: string }>;
}

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const MIN_ITEMS_FOR_INDEX = 3;
const MAX_STATIC_MONTHS = 18;

export async function generateStaticParams() {
  const months = getStaticMonths(new Date(), MAX_STATIC_MONTHS);

  return AREAS.flatMap((area) =>
    months.map(({ year, month }) => ({
      year: String(year),
      month: String(month),
      areaSlug: area.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const parsed = await parseParams(params);
  if (!parsed) return {};

  const { year, month, area } = parsed;
  const { startIso, endIso } = getMonthRange(year, month);
  const count = await getCount(area.code, startIso, endIso);
  const indexable = count >= MIN_ITEMS_FOR_INDEX;

  return {
    title: `${year}년 ${month}월 ${area.name} 축제·행사`,
    description: `${year}년 ${month}월 ${area.name}에서 열리는 축제와 행사 ${count}건을 정리했습니다. 일정·장소·입장료를 한눈에 확인하세요.`,
    alternates: { canonical: `${SITE_URL}/${year}/${month}/${area.slug}` },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function MonthlyAreaPage({ params }: Params) {
  const parsed = await parseParams(params);
  if (!parsed) return notFound();

  const { year, month, area } = parsed;
  const { startIso, endIso } = getMonthRange(year, month);
  const items = await db
    .select()
    .from(festivals)
    .where(
      and(
        eq(festivals.areaCode, area.code),
        lte(festivals.startDate, endIso),
        gte(festivals.endDate, startIso),
        sql`${festivals.isIndexable} = 1`,
      ),
    )
    .orderBy(festivals.startDate)
    .limit(80);

  return (
    <article className="prose-ko">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-2">
        <Link href="/" className="hover:underline">
          홈
        </Link>{" "}
        ›{" "}
        <Link href="/regions" className="hover:underline">
          지역별
        </Link>{" "}
        ›{" "}
        <Link href={`/regions/${area.slug}`} className="hover:underline">
          {area.name}
        </Link>{" "}
        › <span>{year}년 {month}월</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">
        {year}년 {month}월 {area.name} 축제·행사
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {startIso} ~ {endIso} 기간에 겹치는 {area.name} 행사 {items.length}건
      </p>

      {items.length < MIN_ITEMS_FOR_INDEX ? (
        <p className="mt-6 rounded border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-muted)]">
          이 월별 지역 조합은 현재 행사 수가 적어 검색 색인은 보류합니다. 더 넓은
          지역 페이지에서 진행 중·예정 행사를 확인해 주세요.
        </p>
      ) : (
        <ul className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((festival) => (
            <FestivalListCard
              key={festival.contentId}
              href={`/festivals/${festival.contentId}/${festival.slug}`}
              festival={festival}
            />
          ))}
        </ul>
      )}
    </article>
  );
}

async function parseParams(params: Params["params"]) {
  const { year, month, areaSlug } = await params;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const area = findAreaBySlug(decodeURIComponent(areaSlug));

  if (
    !area ||
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    parsedYear < 2020 ||
    parsedYear > 2035 ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return null;
  }

  return { year: parsedYear, month: parsedMonth, area };
}

async function getCount(
  areaCode: string,
  startIso: string,
  endIso: string,
): Promise<number> {
  const rows = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(festivals)
    .where(
      and(
        eq(festivals.areaCode, areaCode),
        lte(festivals.startDate, endIso),
        gte(festivals.endDate, startIso),
        sql`${festivals.isIndexable} = 1`,
      ),
    );

  return Number(rows[0]?.cnt ?? 0);
}

function getMonthRange(year: number, month: number) {
  const startIso = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endIso = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

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
