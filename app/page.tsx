import { db, festivals } from "@/db";
import type { Metadata } from "next";
import { and, desc, gte, lte } from "drizzle-orm";
import Link from "next/link";

import { FestivalListCard } from "@/components/festival/FestivalListCard";
import {
  currentFestivalCondition,
  getWeekendRange,
} from "@/lib/current-festivals";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

const quickFilters = [
  { href: "/weekend", label: "주말 축제", value: "주말 기준 실시간 정렬" },
  { href: "/regions", label: "지역", value: "전국 지역별 추천 축제" },
  { href: "/themes", label: "테마", value: "아이들과,데이트,가족,공연" },
] as const;

const trustItems = [
  "주요 페이지에 메타·정규 URL·스키마를 기본값으로 반영해 검색 노출을 안정화했습니다.",
  "sitemap, robots, feed를 분리 관리하여 수집 경로를 명확하게 유지합니다.",
  "광고는 콘텐츠 흐름을 방해하지 않는 위치에만 배치합니다.",
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
    title: "궁금한 점 문의",
    description: "정보가 다르거나 빠진 부분은 문의 페이지로 알려주세요.",
    href: "/contact",
  },
];

export const metadata: Metadata = {
  title: "Roadways - weekend festival guide",
  description:
    "Roadways helps visitors compare Korean weekend festivals by date, region, theme, venue context, update status, and official source checks.",
  alternates: { canonical: SITE_URL },
};

export const revalidate = 3600;

async function getThisWeekend() {
  const { satIso, sunIso } = getWeekendRange();
  return db
    .select()
    .from(festivals)
    .where(
      and(
        lte(festivals.startDate, sunIso),
        gte(festivals.endDate, satIso),
        currentFestivalCondition(),
      ),
    )
    .limit(12);
}

async function getLatestEvents() {
  return db
    .select()
    .from(festivals)
    .where(currentFestivalCondition())
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

      <section className="rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
        <h2 className="text-[24px] font-semibold leading-tight">
          여행고고 이용 안내
        </h2>
        <div className="prose-body mt-4 space-y-4 leading-8 text-[var(--color-ink-muted)]">
          <p>
            여행고고는 주말 계획을 빠르게 세우려는 방문자를 위한 축제·행사
            큐레이션 서비스입니다. 일정, 지역, 테마, 장소 정보를 정리해 방문 전
            더 알아볼 가치가 있는 행사인지 판단할 수 있도록 돕습니다. 공식 주최
            기관, 티켓 판매처, 긴급 공지 채널, 교통 안내 기관이 아닌 편집
            큐레이션 서비스입니다.
          </p>
          <p>
            방문 전에는 최신 일정, 날씨, 주차, 입장 조건, 취소 공지, 접근성
            정보, 대중교통 이용 방법을 주최 측이나 지자체 공식 채널에서 다시
            확인해 주세요. 야외 행사는 우천, 인원 통제, 안전 점검, 현장 상황에
            따라 갑자기 바뀔 수 있습니다. 여행고고는 후보를 좁히는 데 도움을 줄
            뿐, 최종 방문 결정은 항상 최신 공식 정보를 기준으로 해 주세요.
          </p>
          <p>
            표시된 정보가 실제와 다르거나 중요한 내용이 빠져 있다면 문의
            페이지로 알려주세요. 확인 후 정정하겠습니다.
          </p>
          <p>
            원하는 조건에 따라 주말 페이지에서 날짜 기준으로, 지역 페이지에서
            이동 거리 기준으로, 테마 페이지에서 꽃·음식·공연·가족·야시장 등
            관심사 기준으로 탐색을 시작할 수 있습니다.
          </p>
        </div>
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
              진행 중·예정 축제 중 새로 반영된 항목을 확인합니다. 방문 전 공식
              일정도 확인해 주세요.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--color-brand)] hover:underline"
          >
            축제 가이드 보기
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
