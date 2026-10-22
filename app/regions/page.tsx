import type { Metadata } from "next";
import Link from "next/link";
import { db, festivals } from "@/db";
import { sql } from "drizzle-orm";
import { AREAS, findAreaByCode } from "@/lib/regions";
import { currentFestivalCondition } from "@/lib/current-festivals";
import { HubSourceGuide } from "@/components/festival/HubSourceGuide";

import { MonthLinks } from "@/components/festival/ListNavigation";
import { PageAds } from "@/components/ads/PageAds";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const revalidate = 300;

export const metadata: Metadata = {
  title: "지역별 축제·행사",
  description:
    "전국 17개 시도 축제·행사를 한눈에 확인하세요. 서울·경기·강원부터 제주까지 지역 단위로 모았습니다.",
  alternates: { canonical: `${SITE_URL}/regions` },
};

async function getCountsByArea() {
  const rows = await db
    .select({
      areaCode: festivals.areaCode,
      cnt: sql<number>`count(*)`,
    })
    .from(festivals)
    .where(currentFestivalCondition())
    .groupBy(festivals.areaCode);

  return Object.fromEntries(
    rows.map((r) => [r.areaCode ?? "", Number(r.cnt)]),
  ) as Record<string, number>;
}

export default async function RegionsIndex() {
  const counts: Record<string, number> = await getCountsByArea();

  const unknownCount = Object.entries(counts)
    .filter(([code]) => !findAreaByCode(code))
    .reduce((sum, [, count]) => sum + count, 0);
  return (
    <article className="prose-body prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">지역별 축제·행사</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        전국 17개 시도별로 진행 중·예정 행사를 모았어요.
      </p>

      <ul className="not-prose mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {AREAS.map((a) => {
          const cnt = counts[a.code] ?? 0;
          return (
            <li key={a.code}>
              <Link
                href={`/regions/${a.slug}`}
                className="block rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
              >
                <div className="font-semibold text-[var(--color-ink)]">
                  {a.name}
                </div>
                <div className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  진행·예정 {cnt}건
                </div>
              </Link>
              <MonthLinks areaSlug={a.slug} />
            </li>
          );
        })}
      </ul>

      {unknownCount > 0 && (
        <p className="mt-4">
          <Link href="/regions/미분류" className="underline">
            지역 확인 필요 {unknownCount}건 보기
          </Link>
        </p>
      )}
      <PageAds eligible={Object.values(counts).some((count) => count > 0)} />
      <HubSourceGuide title="지역별" scope="선택한 시도 코드" />
    </article>
  );
}
