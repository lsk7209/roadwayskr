import type { Metadata } from "next";
import Link from "next/link";
import { db, festivals } from "@/db";
import { and, gte, lte, sql } from "drizzle-orm";
import { findAreaByCode } from "@/lib/regions";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

export const revalidate = 86400;

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const { satIso, sunIso } = getThisWeekend();

  return {
    title: `주말 축제 (${satIso} ~ ${sunIso}) 일정 보기`,
    description: `주말 행사 ${satIso} ~ ${sunIso} 기간에 열리는 진행 중·예정 축제 리스트를 지역별로 정리했습니다.`,
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
    <article className="prose-body prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">주말 축제 모아보기</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {satIso} ~ {sunIso} 기간에 열리는 진행 중·예정 축제 {items.length}건을 지역별로
        묶어 보여드립니다.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-[var(--color-ink-muted)]">
          이번 주말에 맞는 축제가 아직 등록되지 않았습니다. 데이터 동기화 후 다시 확인해 주세요.
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

      <section className="mt-12 rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
        <h2 className="text-2xl font-semibold">Weekend planning checklist</h2>
        <div className="mt-4 space-y-4 leading-8 text-[var(--color-ink-muted)]">
          <p>
            This weekend page is a planning index for festivals that overlap
            the selected Saturday and Sunday. It groups events by region so
            readers can compare nearby options, then move into the individual
            event page for dates, venue information, and source context. The
            list is useful for discovery, but it should not be treated as the
            final authority for attendance, tickets, parking, weather, or safety
            notices.
          </p>
          <p>
            Before leaving home, check the organizer page or local government
            announcement for the most recent status. Festival schedules can
            change because of rain, heat warnings, crowd control, construction,
            road restrictions, or venue maintenance. Families should also verify
            stroller access, restrooms, nursing rooms, pet rules, food
            availability, and nearby transit before committing to a route.
          </p>
          <p>
            Roadways keeps this page crawlable with a clear heading hierarchy,
            canonical URL, internal links to region pages, sitemap and robots
            support, and visible policy links in the site footer. The purpose is
            to help visitors and search crawlers understand why the page exists
            even when the number of current weekend events is small. When no
            current data is available, the page still explains the update method
            and directs readers to broader regional and theme indexes.
          </p>
          <p>
            Advertising may be served through Google AdSense Auto Ads only. Ads
            do not decide which events appear, and no manual ad placement is
            added inside the event cards. If a listing looks wrong, duplicated,
            or outdated, use the contact page with the event name and URL so the
            data can be reviewed. This correction path is part of the site
            quality process.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-[var(--color-ink-muted)]">
        주말 축제 데이터는 공개 API와 운영 DB 동기화를 통해 수시로 갱신됩니다.
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
