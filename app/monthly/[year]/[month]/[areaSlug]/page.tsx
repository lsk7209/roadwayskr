import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/db";
import { pageCanonical, shareMetadata } from "@/lib/page-meta";
import { findAreaBySlug } from "@/lib/regions";
import {
  festivalPage,
  parseListSearch,
  listHref,
  type SearchValues,
} from "@/lib/festival-list";
import { monthRange, monthCategory } from "@/lib/festival-dates";
import { FestivalListCard } from "@/components/festival/FestivalListCard";
import {
  ListNavigation,
  MonthLinks,
} from "@/components/festival/ListNavigation";
import { PageAds } from "@/components/ads/PageAds";
import { JsonLd, buildCollectionPageLd } from "@/components/seo/JsonLd";
interface Props {
  params: Promise<{ year: string; month: string; areaSlug: string }>;
  searchParams: Promise<SearchValues>;
}
async function context(props: Props) {
  const raw = await props.params;
  let area;
  try {
    area = findAreaBySlug(decodeURIComponent(raw.areaSlug));
  } catch {
    return null;
  }
  const year = Number(raw.year),
    month = Number(raw.month);
  const search = parseListSearch(await props.searchParams);
  if (
    !area ||
    !/^\d{4}$/.test(raw.year) ||
    !/^\d{1,2}$/.test(raw.month) ||
    year < 2020 ||
    year > 2035 ||
    month < 1 ||
    month > 12 ||
    !search ||
    search.range
  )
    return null;
  const { startIso, endIso } = monthRange(year, month);
  return {
    raw,
    area,
    year,
    month,
    search,
    range: { from: startIso, to: endIso },
    path: `/monthly/${year}/${month}/${area.slug}`,
  };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const ctx = await context(props);
  if (!ctx) return {};
  const { total } = await festivalPage(db, {
    areaCode: ctx.area.code,
    range: ctx.range,
    pageSize: 1,
  });
  const title = `${ctx.year}년 ${ctx.month}월 ${ctx.area.name} 축제·행사`;
  const description = `해당 월과 기간이 겹치는 행사 ${total}건. 월별 시작·종료와 운영일을 확인하세요.`;
  const canonical = pageCanonical(ctx.path, ctx.search.page);
  return {
    title,
    description,
    alternates: { canonical },
    ...shareMetadata({ title, description, url: canonical }),
    robots: { index: total >= 3, follow: true },
  };
}
export default async function MonthlyAreaPage(props: Props) {
  const ctx = await context(props);
  if (!ctx) notFound();
  const { area, year, month, search, range, path, raw } = ctx;
  if (
    raw.month !== String(month) ||
    decodeURIComponent(raw.areaSlug) !== area.slug
  )
    permanentRedirect(listHref(encodeURI(path), undefined, search.page));
  const result = await festivalPage(db, {
    range,
    areaCode: area.code,
    page: search.page,
  });
  if (search.page > result.pages) notFound();
  const neighbors = await Promise.all(
    [-1, 1].map(async (offset) => {
      const d = new Date(Date.UTC(year, month - 1 + offset, 1));
      const y = d.getUTCFullYear(),
        m = d.getUTCMonth() + 1;
      if (y < 2020 || y > 2035) return null;
      const dates = monthRange(y, m);
      const count = await festivalPage(db, {
        areaCode: area.code,
        range: { from: dates.startIso, to: dates.endIso },
        pageSize: 1,
      });
      return count.total
        ? {
            href: `/monthly/${y}/${m}/${area.slug}`,
            label: `${offset < 0 ? "이전" : "다음"} 달 (${y}년 ${m}월)`,
          }
        : null;
    }),
  );
  return (
    <article className="prose-body prose-ko">
      <JsonLd
        id="ld-collection"
        data={buildCollectionPageLd({
          name: `${year}년 ${month}월 ${area.name} 축제·행사`,
          description: "해당 월 행사 기록",
          url: `https://roadways.kr${path}`,
          items: result.items.map((f) => ({
            name: f.title,
            url: `https://roadways.kr/festivals/${f.contentId}/${encodeURIComponent(f.slug)}`,
          })),
        })}
      />
      <nav className="mb-2 text-xs">
        <Link href={`/regions/${area.slug}`} className="underline">
          {area.name}
        </Link>{" "}
        › {year}년 {month}월
      </nav>
      <h1 className="text-3xl font-bold">
        {year}년 {month}월 {area.name} 축제·행사
      </h1>
      <p className="mt-2">
        {range.from} ~ {range.to} 기간과 겹치는 행사 전체 {result.total}건 ·
        현재 표시 {result.items.length}건
      </p>
      <p className="mt-2 text-sm">
        이달 한정·이달 시작·이달 종료·여러 달에 걸친 행사는 서로 겹치지 않는
        기간 구분입니다. 실제 운영 요일은 별도 확인이 필요하며, 종료된 행사는 이
        월의 기록으로 남습니다.
      </p>
      <MonthLinks areaSlug={area.slug} />
      <nav aria-label="인접 월" className="flex flex-wrap gap-4 text-sm">
        {neighbors.map(
          (link) =>
            link && (
              <Link key={link.href} href={link.href} className="underline">
                {link.label}
              </Link>
            ),
        )}
      </nav>
      {result.total === 0 ? (
        <div className="my-8 text-sm">
          <p>이달에 이 지역으로 등록된 행사가 없습니다. 수집 오류가 아니라 해당 조건의 행사가 없다는 뜻입니다.</p>
          <p className="mt-2 space-x-4">
            <Link href={`/regions/${area.slug}`} className="underline">
              {area.shortName} 진행 중·예정 전체
            </Link>
            <Link href="/regions" className="underline">
              다른 지역 보기
            </Link>
          </p>
        </div>
      ) : (
        <ul className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          {result.items.map((festival) => (
            <li key={festival.contentId} className="min-w-0">
              <p className="mb-2 text-sm font-semibold">
                {monthCategory(
                  festival.startDate,
                  festival.endDate,
                  range.from,
                  range.to,
                )}
              </p>
              <ul>
                <FestivalListCard
                  festival={festival}
                  href={`/festivals/${festival.contentId}/${festival.slug}`}
                />
              </ul>
            </li>
          ))}
        </ul>
      )}
      <ListNavigation path={path} page={search.page} pages={result.pages} />
      <PageAds eligible={result.items.length > 0} />
    </article>
  );
}
