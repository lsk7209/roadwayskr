import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, gte, sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { AREAS, findAreaBySlug } from "@/lib/regions";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

export const revalidate = 3600;

interface Params {
  params: Promise<{ areaSlug: string }>;
}

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const MIN_ITEMS_FOR_INDEX = 3;

export async function generateStaticParams() {
  return AREAS.map((a) => ({ areaSlug: a.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { areaSlug } = await params;
  const decoded = decodeURIComponent(areaSlug);
  const area = findAreaBySlug(decoded);
  if (!area) return {};

  const url = `${SITE_URL}/regions/${area.slug}`;

  // 가치 평가: 진행 중 + 예정 합쳐 최소 N건 이상이어야 색인
  const ongoing = await getCount(area.code);
  const indexable = ongoing >= MIN_ITEMS_FOR_INDEX;

  return {
    title: `${area.name} 축제·행사`,
    description: `${area.name}의 진행 중·예정 축제와 행사 ${ongoing}건을 큐레이션했어요. 거리·운영시간·입장료·어린이 동반 정보까지 한눈에.`,
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function AreaHub({ params }: Params) {
  const { areaSlug } = await params;
  const decoded = decodeURIComponent(areaSlug);
  const area = findAreaBySlug(decoded);
  if (!area) return notFound();

  const today = new Date().toISOString().slice(0, 10);
  const items = await db
    .select()
    .from(festivals)
    .where(
      and(
        eq(festivals.areaCode, area.code),
        gte(festivals.endDate, today),
        sql`${festivals.isIndexable} = 1`,
      ),
    )
    .orderBy(festivals.startDate)
    .limit(60);

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
        › <span>{area.name}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">
        {area.name} 축제·행사
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {area.name} 진행 중·예정 행사 {items.length}건
      </p>

      {items.length < MIN_ITEMS_FOR_INDEX ? (
        <p className="mt-6 rounded border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-muted)]">
          현재 등록된 진행·예정 행사가 적습니다. 데이터 동기화 직후이거나 비수기일
          수 있어요. 인근 지역 페이지를 둘러보세요.
        </p>
      ) : (
        <ul className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((f) => (
            <FestivalListCard
              key={f.contentId}
              href={`/festivals/${f.contentId}/${f.slug}`}
              festival={f}
            />
          ))}
        </ul>
      )}
    </article>
  );
}

async function getCount(areaCode: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(festivals)
    .where(
      and(
        eq(festivals.areaCode, areaCode),
        gte(festivals.endDate, today),
        sql`${festivals.isIndexable} = 1`,
      ),
    );
  return Number(rows[0]?.cnt ?? 0);
}
