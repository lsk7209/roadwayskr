import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/db";
import { findAreaBySlug } from "@/lib/regions";
import {
  festivalPage,
  listHref,
  parseListSearch,
  type SearchValues,
} from "@/lib/festival-list";
import { FestivalListCard } from "@/components/festival/FestivalListCard";
import {
  ListNavigation,
  MonthLinks,
} from "@/components/festival/ListNavigation";
import { pageCanonical, shareMetadata } from "@/lib/page-meta";
import { PageAds } from "@/components/ads/PageAds";
import { JsonLd, buildCollectionPageLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ areaSlug: string }>;
  searchParams: Promise<SearchValues>;
}
async function context({ params, searchParams }: Props) {
  const { areaSlug } = await params;
  let decoded: string;
  try {
    decoded = decodeURIComponent(areaSlug);
  } catch {
    return null;
  }
  const area =
    decoded === "미분류"
      ? {
          code: "unknown",
          slug: "미분류",
          name: "지역 확인 필요",
          shortName: "미분류",
        }
      : findAreaBySlug(decoded);
  const search = parseListSearch(await searchParams);
  if (!area || !search) return null;
  return { area, search, decoded };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const ctx = await context(props);
  if (!ctx) return {};
  const { total } = await festivalPage(db, {
    ...ctx.search,
    areaCode: ctx.area.code,
    pageSize: 1,
  });
  const title = `${ctx.area.name} 축제·행사`;
  const description = `${ctx.area.name} 행사 ${total}건. 날짜와 장소를 확인하세요.`;
  const path = `/regions/${ctx.area.slug}`;
  // 범위 안의 정상 page=N은 자기 canonical. 임의 날짜 필터는 기본 목록으로 모으고 noindex.
  const canonical = ctx.search.range
    ? listHref(`https://roadways.kr${encodeURI(path)}`, ctx.search.range, ctx.search.page)
    : pageCanonical(path, ctx.search.page);
  return {
    title,
    description,
    alternates: { canonical },
    ...shareMetadata({ title, description, url: canonical }),
    robots: {
      index:
        total >= 3 && !ctx.search.range && ctx.area.code !== "unknown",
      follow: true,
    },
  };
}
export default async function AreaHub(props: Props) {
  const ctx = await context(props);
  if (!ctx) notFound();
  const { area, search, decoded } = ctx;
  const path = `/regions/${area.slug}`;
  if (decoded !== area.slug) {
    permanentRedirect(listHref(encodeURI(path), search.range, search.page));
  }
  const result = await festivalPage(db, { ...search, areaCode: area.code });
  if (search.page > result.pages) notFound();
  return (
    <article className="prose-body prose-ko">
      <JsonLd
        id="ld-collection"
        data={buildCollectionPageLd({
          name: `${area.name} 축제·행사`,
          description: "선택한 지역과 기간의 행사",
          url: `https://roadways.kr${path}`,
          items: result.items.map((f) => ({
            name: f.title,
            url: `https://roadways.kr/festivals/${f.contentId}/${encodeURIComponent(f.slug)}`,
          })),
        })}
      />
      <nav className="mb-2 text-xs">
        <Link href="/regions" className="underline">
          지역별
        </Link>{" "}
        › {area.name}
      </nav>
      <h1 className="text-3xl font-bold">{area.name} 축제·행사</h1>
      <p className="mt-2">
        {search.range
          ? `${search.range.from} ~ ${search.range.to}`
          : "진행 중·예정"}{" "}
        행사 전체 {result.total}건 · 현재 표시 {result.items.length}건
      </p>
      {search.range && (
        <p className="mt-2 text-sm">
          <Link href={path} className="underline">
            {area.name} 진행 중·예정 전체 기간 행사 보기
          </Link>
        </p>
      )}
      {area.code !== "unknown" && <MonthLinks areaSlug={area.slug} />}
      {result.total === 0 ? (
        <p className="my-8">선택한 조건에 등록된 행사가 없습니다.</p>
      ) : (
        <ul className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          {result.items.map((festival, i) => (
            <FestivalListCard
              key={festival.contentId}
              festival={festival}
              href={`/festivals/${festival.contentId}/${festival.slug}`}
              priority={i === 0}
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          ))}
        </ul>
      )}
      <ListNavigation
        path={path}
        range={search.range}
        page={search.page}
        pages={result.pages}
      />
      <PageAds eligible={result.items.length > 0} />
    </article>
  );
}
