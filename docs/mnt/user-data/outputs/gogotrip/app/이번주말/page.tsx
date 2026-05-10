import type { Metadata } from "next";
import Link from "next/link";
import { db, festivals } from "@/db";
import { and, gte, lte, sql } from "drizzle-orm";
import { AREAS, findAreaByCode } from "@/lib/regions";

// 매일 갱신 (자정 기준 ISR)
export const revalidate = 86400;

const SITE_URL = process.env.SITE_URL ?? "https://gogotrip.kr";

export async function generateMetadata(): Promise<Metadata> {
  const { satIso, sunIso } = getThisWeekend();
  return {
    title: `이번 주말 (${satIso} ~ ${sunIso}) 가볼만한 행사`,
    description: `이번 주말 ${satIso}부터 ${sunIso}까지 진행되는 전국 축제·행사를 큐레이션했어요.`,
    alternates: { canonical: `${SITE_URL}/이번주말` },
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

  // 시도별 그룹핑
  const byArea = new Map<string, typeof items>();
  for (const f of items) {
    const code = f.areaCode ?? "기타";
    if (!byArea.has(code)) byArea.set(code, []);
    byArea.get(code)!.push(f);
  }

  return (
    <article className="prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">이번 주말 행사</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {satIso} (토) ~ {sunIso} (일) 진행되는 전국 축제·행사 {items.length}건
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
          이번 주말 진행되는 행사가 아직 동기화되지 않았습니다. 데이터를 가져온
          뒤 다시 확인해 주세요.
        </p>
      ) : (
        <div className="not-prose mt-8 space-y-10">
          {[...byArea.entries()].map(([code, list]) => {
            const area = findAreaByCode(code);
            if (!area) return null;
            return (
              <section key={code}>
                <div className="flex items-end justify-between mb-3">
                  <h2 className="text-xl font-bold">
                    {area.name}{" "}
                    <span className="text-sm text-[var(--color-ink-muted)]">
                      {list.length}건
                    </span>
                  </h2>
                  <Link
                    href={`/지역/${area.slug}`}
                    className="text-sm text-[var(--color-brand)] hover:underline"
                  >
                    전체 →
                  </Link>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {list.slice(0, 6).map((f) => (
                    <li
                      key={f.contentId}
                      className="rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3"
                    >
                      <Link
                        href={`/축제/${f.contentId}/${f.slug}`}
                        className="block"
                      >
                        <div className="font-semibold text-sm">{f.title}</div>
                        <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                          {f.startDate} ~ {f.endDate}
                        </div>
                        {f.address && (
                          <div className="mt-1 text-xs text-[var(--color-ink-muted)] truncate">
                            {f.address}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-xs text-[var(--color-ink-muted)]">
        매주 토·일 직전에 자동 갱신됩니다. 데이터 출처: 한국관광공사 TourAPI.
      </p>
    </article>
  );
}

function getThisWeekend() {
  const today = new Date();
  const day = today.getUTCDay(); // 0=일, 6=토
  const sat = new Date(today);
  // 가장 가까운 다음 토요일 (오늘이 토요일이면 오늘)
  const offset = day === 6 ? 0 : (6 - day + 7) % 7;
  sat.setUTCDate(today.getUTCDate() + offset);
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { satIso: fmt(sat), sunIso: fmt(sun) };
}
