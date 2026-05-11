import { db, festivals } from "@/db";
import type { Metadata } from "next";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";

import { FestivalListCard } from "@/components/festival/FestivalListCard";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

const quickFilters = [
  { href: "/weekend", label: "주말 축제", value: "주말 기준 실시간 정렬" },
  { href: "/regions", label: "지역", value: "전국 지역별 추천 축제" },
  { href: "/themes", label: "테마", value: "아이들과,데이트,가족,공연" },
] as const;

const trustItems = [
  "주요 페이지에 메타·정규 URL·스키마를 기본값으로 반영해 검색 노출을 안정화했습니다.",
  "sitemap, robots, feed를 분리 관리하여 수집 경로를 명확하게 유지합니다.",
  "광고는 콘텐츠 흐름을 깨지 않게 배치하고, 자동노출 가이드를 준수해 검수 리스크를 낮춥니다.",
] as const;

const planCards = [
  {
    title: "가볍게 보기",
    description: "카드 한 번에 4개 이하만 먼저 노출해 렌더링 부담을 낮춥니다.",
    href: "/weekend",
  },
  {
    title: "빠르게 찾기",
    description: "지역/테마 필터에서 원하는 축제를 바로 탐색할 수 있습니다.",
    href: "/regions",
  },
  {
    title: "지금 확인",
    description:
      "업데이트 상태와 운영 점검 내역을 /plan에서 한 번에 확인하세요.",
    href: "/plan",
  },
];

export const metadata: Metadata = {
  title: "여행고고 - 주말 축제 가이드",
  description:
    "한국의 주말 축제 정보를 빠르게 찾고, 지역·테마별로 비교합니다. 실시간 정보, 최신 데이터, 정렬 최적화로 가독성 높은 여행 안내를 제공합니다.",
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
    <div className="space-y-14">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-[0.12em] text-[var(--color-brand)]">
          여행고고
        </p>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-[var(--color-ink)] sm:text-[38px]">
          주말 축제는 여행고고로 한 번에
        </h1>
        <p className="prose-body mt-4 text-[1.04rem] leading-8 text-[var(--color-ink-muted)]">
          전국 축제 정보를 한 페이지에서 찾고, 지역과 테마로 나누어 빠르게
          비교하세요. 새로고침 없이 핵심 항목을 파악할 수 있는 구성으로 가독성을
          우선 반영했습니다.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {quickFilters.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[var(--color-line)] bg-white p-4 text-left shadow-[var(--shadow-float)] transition hover:border-[var(--color-brand)]"
            >
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-card)] p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight">
              이번 주말 추천
            </h2>
            <p className="mt-2 prose-body text-[var(--color-ink-muted)]">
              기간 기준으로 필터링한 실제 진행 축제를 우선 표시합니다.
            </p>
          </div>
          <Link
            href="/weekend"
            className="text-sm font-semibold text-[var(--color-brand)] hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {weekend.length === 0 ? (
          <p className="rounded-2xl bg-[var(--color-surface-soft)] p-5 text-sm leading-7 text-[var(--color-muted)]">
            데이터가 아직 적재되지 않았습니다. 잠시 후 다시 확인해 주세요.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {weekend.map((festival, i) => (
              <FestivalListCard
                key={festival.contentId}
                href={`/festivals/${festival.contentId}/${festival.slug}`}
                festival={festival}
                titleLevel="h3"
                priority={i === 0}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {planCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-[var(--color-line)] bg-white p-5"
          >
            <h3 className="text-lg font-bold">{card.title}</h3>
            <p className="prose-body mt-2 leading-8 text-[var(--color-ink-muted)]">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-4 inline-block text-sm font-semibold text-[var(--color-brand)] hover:underline"
            >
              바로 이동
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-[24px] font-semibold leading-tight">
            신뢰 운영 기준
          </h2>
          <p className="prose-body mt-2 text-[var(--color-ink-muted)]">
            검색·광고·분석에 불필요한 리스크를 줄이는 기준입니다.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {trustItems.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-4 text-sm leading-8 text-[var(--color-body)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 760px",
        }}
        className="rounded-2xl border border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] p-6"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight">
              최신 업데이트
            </h2>
            <p className="prose-body mt-2 text-[var(--color-ink-muted)]">
              새로 반영된 항목부터 한눈에 확인합니다.
            </p>
          </div>
          <Link
            href="/plan"
            className="text-sm font-semibold text-[var(--color-brand)] hover:underline"
          >
            운영 상태 보기
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-5 text-sm leading-7 text-[var(--color-muted)]">
            최근 업데이트된 데이터가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
