import type { Metadata } from "next";
import Link from "next/link";
import { db, festivals } from "@/db";
import { and, gte, lte, sql } from "drizzle-orm";
import { findAreaByCode } from "@/lib/regions";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

export const revalidate = 86400;

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

export async function generateMetadata(): Promise<Metadata> {
  const { satIso, sunIso } = getThisWeekend();

  return {
    title: `이번 주말 (${satIso} ~ ${sunIso}) 가볼만한 행사`,
    description: `이번 주말 ${satIso}부터 ${sunIso}까지 진행되는 전국 축제와 행사를 정리했습니다.`,
    alternates: { canonical: `${SITE_URL}/weekend` },
  };
}

export default async function ThisWeekendPage() {
  const { satIso, sunIso } = getThisWeekend();
  const items = await db
    .select()
    .from(festivals)
    .where(
      and(
        lte(festivals.startDate, sunIso),
        gte(festivals.endDate, satIso),
        sql`${festivals.isIndexable} = 1`,
      ),
    )
    .orderBy(festivals.startDate)
    .limit(60);

  const byArea = new Map<string, typeof items>();
  for (const festival of items) {
    const code = festival.areaCode ?? "unknown";
    if (!byArea.has(code)) byArea.set(code, []);
    byArea.get(code)!.push(festival);
  }

  return (
    <article className="prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">이번 주말 행사</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {satIso} 토요일부터 {sunIso} 일요일까지 진행되는 전국 축제·행사{" "}
        {items.length}건을 모았습니다.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
          이번 주말 진행되는 행사가 아직 확인되지 않았습니다. 데이터가 갱신된 뒤
          다시 확인해 주세요.
        </p>
      ) : (
        <div className="not-prose mt-8 space-y-10">
          {[...byArea.entries()].map(([code, list]) => {
            const area = findAreaByCode(code);
            if (!area) return null;

            return (
              <section key={code}>
                <div className="mb-4 flex items-end justify-between border-b border-[var(--color-line)] pb-2">
                  <h2 className="text-xl font-bold">
                    {area.name}{" "}
                    <span className="text-sm text-[var(--color-ink-muted)]">
                      {list.length}건
                    </span>
                  </h2>
                  <Link
                    href={`/regions/${area.slug}`}
                    className="text-sm text-[var(--color-brand)] hover:underline"
                  >
                    전체 보기
                  </Link>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {list.slice(0, 6).map((festival) => (
                    <FestivalListCard
                      key={festival.contentId}
                      href={`/festivals/${festival.contentId}/${festival.slug}`}
                      festival={festival}
                      titleLevel="h3"
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-xs text-[var(--color-ink-muted)]">
        매주 토·일 기준으로 자동 갱신됩니다. 데이터 출처: 한국관광공사 TourAPI.
      </p>
    </article>
  );
}

function getThisWeekend() {
  const today = new Date();
  const day = today.getUTCDay();
  const offset = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(today);
  sat.setUTCDate(today.getUTCDate() + offset);

  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);

  const fmt = (date: Date) => date.toISOString().slice(0, 10);
  return { satIso: fmt(sat), sunIso: fmt(sun) };
}
