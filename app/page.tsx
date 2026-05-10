import { db, festivals } from "@/db";
import type { Metadata } from "next";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";

import { FestivalListCard } from "@/components/festival/FestivalListCard";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

const quickLinks = [
  {
    href: "/weekend",
    label: "이번 주말 보기",
    description: "토,일 기준으로 열리는 행사를 빠르게 확인",
  },
  {
    href: "/regions",
    label: "지역별 보기",
    description: "관심 지역부터 빠르게 비교하고 이동 동선 잡기",
  },
  {
    href: "/themes",
    label: "테마별 보기",
    description: "음식·축제·캠핑 등 유형별로 원하는 콘텐츠만 추림",
  },
] as const;

export const metadata: Metadata = {
  title: "여행고고 - 이번 주말 축제·행사 큐레이션",
  description:
    "한국 국내 축제·행사 정보를 주말/월별, 지역, 테마로 빠르게 정리해 핵심 정보(거리·운영시간·입장료·주차)를 먼저 보여줍니다.",
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

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
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
    <div className="space-y-10">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <article>
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-brand)]">
              WEEKEND + FESTIVAL GUIDE
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
              이번 주말, 바로 쓸 수 있는 행사 정보를 한 번에 정리했습니다
            </h1>
            <p className="mt-3 max-w-3xl text-[var(--color-ink-muted)] leading-relaxed">
              지역·테마·월별 탐색을 기본 동선으로 구성해, 주소·운영시간·입장료·주차 정보를
              빠르게 확인할 수 있습니다.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--color-line)] bg-white p-3 text-sm font-semibold transition hover:border-[var(--color-brand)] hover:bg-[var(--color-paper)]"
                >
                  <span className="block font-semibold">{link.label}</span>
                  <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>
          </article>

          <aside
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            aria-label="광고 검수용 콘텐츠 신뢰 항목"
          >
            <h2 className="text-base font-bold">검수 안정화 체크</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
              <li>• 중복 없는 고유 URL, 중복 본문 최소화</li>
              <li>• 핵심 메타/JSON-LD 구조 기반 정보 표기</li>
              <li>• 404/빈 페이지 노출 억제</li>
              <li>• 자동광고는 본문 가독성 유지 영역에만 노출</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-4">
        <h2 className="text-lg font-bold">여행고고의 우선 확인 항목</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm leading-relaxed">
            주소·교통: 실제 이동 동선을 기준으로 빠른 판단을 돕습니다.
          </p>
          <p className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm leading-relaxed">
            운영시간: 개장/종료, 행사 구성 시간, 주요 프로그램 시작 시점을 우선 표시합니다.
          </p>
          <p className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm leading-relaxed">
            비용·제약: 입장료, 연령 제한, 주차 여부를 요약해 비교를 쉽게 합니다.
          </p>
          <p className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm leading-relaxed">
            업데이트: 페이지별 마지막 갱신 시각으로 정보 신선도를 유지합니다.
          </p>
        </div>
      </section>

      <section
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 500px",
        }}
      >
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold">이번 주말 진행 중·시작하는 행사</h2>
          <Link href="/weekend" className="text-sm text-[var(--color-brand)] hover:underline">
            전체 보기 →
          </Link>
        </div>

        {weekend.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            동기화된 데이터가 아직 없습니다. <code>pnpm sync:tourapi:full</code> 실행 후
            확인해 주세요.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekend.map((f) => (
              <FestivalListCard
                key={f.contentId}
                href={`/festivals/${f.contentId}/${f.slug}`}
                festival={f}
                titleLevel="h3"
              />
            ))}
          </ul>
        )}
      </section>

      <section
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 500px",
        }}
      >
        <h2 className="text-xl font-bold">최근 업데이트한 행사</h2>
        {latest.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            최신 업데이트 항목을 불러오지 못했습니다.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((f) => (
              <FestivalListCard
                key={`latest-${f.contentId}`}
                href={`/festivals/${f.contentId}/${f.slug}`}
                festival={f}
                titleLevel="h3"
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
        <h2 className="text-xl font-bold">자주 묻는 질문</h2>
        <div className="mt-3 space-y-3">
          <details className="rounded-lg border border-[var(--color-line)] p-4">
            <summary className="cursor-pointer font-semibold">행사가 취소되면 반영이 되나요?</summary>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              취소·변경 정보는 데이터 동기화 주기 내에서 우선 반영되며, 공식 공지 링크로 최종
              확인할 수 있습니다.
            </p>
          </details>
          <details className="rounded-lg border border-[var(--color-line)] p-4">
            <summary className="cursor-pointer font-semibold">노출 품질 기준은 어떻게 되나요?</summary>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              핵심 정보가 빈약한 페이지는 비노출 대상으로 분류해 정보 신뢰성을 보호합니다.
            </p>
          </details>
          <details className="rounded-lg border border-[var(--color-line)] p-4">
            <summary className="cursor-pointer font-semibold">광고는 어떻게 노출되나요?</summary>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Google AdSense 자동광고로 운영하고, 본문 구조를 깨지 않는 블록 여백을 기본 규칙으로
              둡니다.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
