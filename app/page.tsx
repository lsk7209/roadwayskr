import { db, festivals } from "@/db";
import type { Metadata } from "next";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";

import { FestivalListCard } from "@/components/festival/FestivalListCard";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

const quickFilters = [
  { href: "/weekend", label: "이번 주말", value: "가까운 일정" },
  { href: "/regions", label: "지역별", value: "17개 시도" },
  { href: "/themes", label: "테마별", value: "꽃·음식·문화" },
] as const;

const trustItems = [
  "행사 기간과 장소를 먼저 확인합니다.",
  "주차·입장료·운영 정보는 상세 페이지에서 분리해 보여줍니다.",
  "sitemap, robots, ads.txt, JSON-LD를 운영 기준으로 점검합니다.",
] as const;

export const metadata: Metadata = {
  title: "여행고고 - 이번 주말 축제·행사 큐레이션",
  description:
    "전국 축제와 행사를 주말, 지역, 테마 기준으로 빠르게 정리합니다. 가족 나들이와 주말 여행에 필요한 기본 정보를 한곳에서 확인하세요.",
  alternates: { canonical: SITE_URL },
};

export const revalidate = 3600;

async function getThisWeekend() {
  const today = new Date();
  const day = today.getUTCDay();
  const sat = new Date(today);
  sat.setUTCDate(today.getUTCDate() + ((6 - day + 7) % 7));
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);

  const fmt = (date: Date) => date.toISOString().slice(0, 10);
  return db
    .select()
    .from(festivals)
    .where(
      and(
        lte(festivals.startDate, fmt(sun)),
        gte(festivals.endDate, fmt(sat)),
        sql`${festivals.isIndexable} = 1`,
      ),
    )
    .limit(12);
}

async function getLatestEvents() {
  return db
    .select()
    .from(festivals)
    .where(sql`${festivals.isIndexable} = 1`)
    .orderBy(desc(festivals.updatedAt))
    .limit(8);
}

export default async function Home() {
  const weekend = await getThisWeekend().catch(() => []);
  const latest = await getLatestEvents().catch(() => []);

  return (
    <div className="space-y-16">
      <section className="pt-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-[var(--color-brand)]">
            Weekend festival guide
          </p>
          <h1 className="mt-3 text-[28px] font-bold leading-tight text-[var(--color-ink)] sm:text-[34px]">
            이번 주말, 어디 갈지 고르는 가장 쉬운 방법
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            전국 축제와 행사를 사진, 일정, 지역 기준으로 정리했습니다. 먼저 끌리는
            장면을 고르고, 상세 페이지에서 기간과 장소를 확인하세요.
          </p>
        </div>

        <Link
          href="/weekend"
          className="mx-auto mt-8 flex max-w-sm items-center justify-between rounded-full border border-[var(--color-line)] bg-white px-5 py-4 text-left shadow-[var(--shadow-float)] md:hidden"
        >
          <span>
            <span className="block text-sm font-semibold text-[var(--color-ink)]">
              어디로 떠날까요?
            </span>
            <span className="mt-1 block text-sm text-[var(--color-muted)]">
              이번 주말 행사 검색
            </span>
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-brand)] text-white">
            ⌕
          </span>
        </Link>

        <div className="mx-auto mt-8 hidden max-w-4xl rounded-full border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-float)] md:block">
          <div className="grid gap-1 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            {quickFilters.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-5 py-3 transition hover:bg-[var(--color-surface-soft)]"
              >
                <span className="block text-xs font-semibold text-[var(--color-ink)]">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-[var(--color-muted)]">
                  {item.value}
                </span>
              </Link>
            ))}
            <Link
              href="/weekend"
              className="grid h-12 w-full place-items-center rounded-full bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-dark)] md:w-12 md:px-0"
              aria-label="이번 주말 행사 검색"
            >
              <span aria-hidden="true">⌕</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 820px",
        }}
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight">
              이번 주말 진행 중·시작하는 행사
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              사진을 먼저 보고 마음에 드는 행사를 골라보세요.
            </p>
          </div>
          <Link
            href="/weekend"
            className="shrink-0 text-sm font-semibold text-[var(--color-brand)] hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {weekend.length === 0 ? (
          <p className="rounded-[14px] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-muted)]">
            동기화된 데이터가 아직 없습니다. TourAPI 동기화 후 다시 확인해 주세요.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {weekend.map((festival) => (
              <FestivalListCard
                key={festival.contentId}
                href={`/festivals/${festival.contentId}/${festival.slug}`}
                festival={festival}
                titleLevel="h3"
              />
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-[var(--color-line-soft)] py-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight">
              애드센스 검수용 기본 신뢰 요소
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              광고보다 콘텐츠가 먼저 보이도록 구성하고, 검색엔진이 읽을 수 있는
              구조화 데이터를 함께 유지합니다.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {trustItems.map((item) => (
              <li
                key={item}
                className="rounded-[14px] border border-[var(--color-line)] p-5 text-sm leading-6 text-[var(--color-body)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 680px",
        }}
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight">
              최근 업데이트한 행사
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              새로 정리되거나 정보가 갱신된 행사입니다.
            </p>
          </div>
        </div>

        {latest.length === 0 ? (
          <p className="rounded-[14px] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-muted)]">
            최신 업데이트 목록을 불러오지 못했습니다.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((festival) => (
              <FestivalListCard
                key={`latest-${festival.contentId}`}
                href={`/festivals/${festival.contentId}/${festival.slug}`}
                festival={festival}
                titleLevel="h3"
              />
            ))}
          </ul>
        )}
      </section>

      <section className="pb-8">
        <h2 className="text-[22px] font-semibold leading-tight">자주 묻는 질문</h2>
        <div className="mt-4 divide-y divide-[var(--color-line-soft)] border-y border-[var(--color-line-soft)]">
          <details className="py-5">
            <summary className="cursor-pointer text-base font-semibold">
              행사 정보가 바뀌면 반영되나요?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
              TourAPI 데이터 갱신 주기에 맞춰 변경된 행사 기간, 장소, 이미지 정보를
              다시 반영합니다.
            </p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-base font-semibold">
              광고는 어떻게 노출되나요?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
              Google AdSense 자동광고를 사용하되, 콘텐츠 탐색 흐름을 해치지 않는
              범위에서 운영합니다.
            </p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-base font-semibold">
              검색엔진 제출도 자동으로 되나요?
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
              sitemap, robots, IndexNow 키를 유지해 신규·갱신 URL을 검색엔진이 더
              쉽게 발견할 수 있도록 구성했습니다.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
