import type { Metadata } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "여행고고 축제 가이드",
  description:
    "최근 업데이트된 전국 축제·행사 목록을 지역, 테마, 공식 정보 확인 방법과 함께 정리했습니다.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export const revalidate = 3600;

async function getLatestFestivalGuides() {
  return db
    .select()
    .from(festivals)
    .where(sql`${festivals.isIndexable} = 1`)
    .orderBy(desc(festivals.updatedAt))
    .limit(24);
}

export default async function BlogPage() {
  const latest = await getLatestFestivalGuides().catch(() => []);

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-[0.12em] text-[var(--color-brand)]">
          여행고고 축제 가이드
        </p>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-[var(--color-ink)] sm:text-[38px]">
          최근 업데이트된 축제·행사 목록
        </h1>
        <p className="prose-body mt-4 text-[1.04rem] leading-8 text-[var(--color-ink-muted)]">
          날짜, 지역, 테마별로 정리한 축제 목록입니다. 방문 전 공식 채널에서
          최신 일정을 다시 확인해 주세요.
        </p>
      </section>

      {latest.length === 0 ? (
        <section className="rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
          <h2 className="text-[24px] font-semibold leading-tight">
            목록을 갱신 중입니다
          </h2>
          <p className="prose-body mt-3 leading-8 text-[var(--color-ink-muted)]">
            지금은 표시할 축제 데이터가 없습니다. 갱신되는 동안 주말·지역
            페이지를 이용해 주세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/weekend"
              className="text-[var(--color-brand)] hover:underline"
            >
              주말 축제
            </Link>
            <Link
              href="/regions"
              className="text-[var(--color-brand)] hover:underline"
            >
              지역별 축제
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
          <div className="mb-5">
            <h2 className="text-[24px] font-semibold leading-tight">
              최근 업데이트된 축제 목록
            </h2>
            <p className="prose-body mt-2 text-[var(--color-ink-muted)]">
              최근 정보가 갱신된 축제·행사 목록입니다.
            </p>
          </div>
          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((festival, index) => (
              <FestivalListCard
                key={festival.contentId}
                href={`/festivals/${festival.contentId}/${festival.slug}`}
                festival={festival}
                titleLevel="h3"
                priority={index === 0}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
