import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { getWeekendRange } from "@/lib/current-festivals";
import {
  festivalGroups,
  festivalPage,
  listHref,
  parseListSearch,
  type SearchValues,
} from "@/lib/festival-list";
import { findAreaByCode } from "@/lib/regions";
import { FestivalListCard } from "@/components/festival/FestivalListCard";
import { shareMetadata } from "@/lib/page-meta";
import { PageAds } from "@/components/ads/PageAds";

interface Props {
  searchParams: Promise<SearchValues>;
}
async function selectedRange(search: Props["searchParams"]) {
  const parsed = parseListSearch(await search);
  if (!parsed) return null;
  const { satIso, sunIso } = getWeekendRange();
  return parsed.range ?? { from: satIso, to: sunIso };
}
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const range = await selectedRange(searchParams);
  if (!range) return {};
  const raw = await searchParams;
  const custom = raw.from !== undefined || raw.to !== undefined;
  const url = custom
    ? listHref("https://roadways.kr/weekend", range)
    : "https://roadways.kr/weekend";
  const title = `주말 축제·행사 (${range.from} ~ ${range.to})`;
  const description = "선택한 기간의 지역별 행사와 실제 운영일을 확인하세요.";
  return {
    title,
    description,
    // 임의 날짜 조회는 기본 주말 목록의 복제본이 아니므로 자기 URL을 canonical로 두고 noindex.
    alternates: { canonical: url },
    robots: custom ? { index: false, follow: true } : undefined,
    ...shareMetadata({ title, description, url }),
  };
}
export default async function WeekendPage({ searchParams }: Props) {
  const range = await selectedRange(searchParams);
  if (!range) notFound();
  const groups = await festivalGroups(db, { range });
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  // festivalGroups() already computed each area's total via GROUP BY, so
  // festivalPage() does not need to redundantly re-run count(*) per area.
  // This turns the fan-out from 1 + 2*G queries into 1 + G.
  const previews = await Promise.all(
    groups.map(async (group) => ({
      ...group,
      ...(await festivalPage(db, {
        range,
        areaCode: group.code,
        pageSize: 6,
        knownTotal: group.count,
      })),
    })),
  );
  return (
    <article className="prose-body prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">주말 축제 모아보기</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {range.from} ~ {range.to} 기간과 겹치는 행사 전체 {total}건
      </p>
      <p className="mt-2 text-sm">
        토요일에 끝난 행사도 이 주말 목록에 포함됩니다. 실제 운영 요일·당일 취소
        여부는 상세 안내를 확인해 주세요. 지역별 미리보기는 기간이 짧은 행사를
        먼저, 31일을 넘는 장기·상설 행사를 뒤에 보여줍니다.
      </p>
      {total === 0 && (
        <p className="my-8">선택한 기간에 등록된 행사가 없습니다.</p>
      )}
      <div className="not-prose mt-8 space-y-10">
        {previews.map((group) => {
          const area = findAreaByCode(group.code);
          const name = area?.name ?? "지역 확인 필요";
          return (
            <section key={group.code}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                <h2 className="text-xl font-bold">
                  {name}{" "}
                  <span className="text-sm">
                    전체 {group.count}건 · 미리보기 {group.items.length}건
                  </span>
                </h2>
                <Link
                  className="text-sm underline"
                  href={listHref(`/regions/${area?.slug ?? "미분류"}`, range)}
                >
                  {name} 선택 기간 전체 보기
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {group.items.map((festival) => (
                  <FestivalListCard
                    key={festival.contentId}
                    festival={festival}
                    href={`/festivals/${festival.contentId}/${festival.slug}`}
                    titleLevel="h3"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <PageAds eligible={total > 0} />
    </article>
  );
}
