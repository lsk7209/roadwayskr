import type { Metadata } from "next";
import Link from "next/link";
import { db, festivals } from "@/db";
import { sql } from "drizzle-orm";
import { AREAS } from "@/lib/regions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "지역별 축제·행사",
  description:
    "전국 17개 시도별 축제·행사를 한눈에. 서울·경기·강원부터 제주까지 지역 단위로 모았습니다.",
  alternates: { canonical: "/지역" },
};

async function getCountsByArea() {
  const rows = await db
    .select({
      areaCode: festivals.areaCode,
      cnt: sql<number>`count(*)`,
    })
    .from(festivals)
    .where(sql`${festivals.isIndexable} = 1 AND ${festivals.status} != 'ended'`)
    .groupBy(festivals.areaCode);

  return Object.fromEntries(
    rows.map((r) => [r.areaCode ?? "", Number(r.cnt)]),
  ) as Record<string, number>;
}

export default async function RegionsIndex() {
  const counts: Record<string, number> = await getCountsByArea().catch(
    () => ({}),
  );

  return (
    <article className="prose-ko">
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
                href={`/지역/${a.slug}`}
                className="block rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-4 hover:border-[var(--color-brand)] transition-colors"
              >
                <div className="font-semibold">{a.name}</div>
                <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  진행·예정 {cnt}건
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
