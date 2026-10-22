import { db, festivals } from "@/db";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

import { InfoCards } from "@/components/festival/InfoCards";
import { EventSchema } from "@/components/festival/EventSchema";
import { CuratorNote } from "@/components/festival/CuratorNote";
import { JsonLd, buildBreadcrumbListLd } from "@/components/seo/JsonLd";
import {
  cleanTourText,
  extractFirstUrl,
  extractTourIntroProgram,
  toParagraphs,
} from "@/lib/content";

import { cache } from "react";
import { festivalPeriod, operatingTime } from "@/lib/festival-facts";
import { formatPeriod } from "@/lib/festival-dates";
import { eventSourceNote } from "@/lib/event-source-notes";
import { BackToList } from "@/components/festival/BackToList";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PageAds } from "@/components/ads/PageAds";
import { FestivalListCard } from "@/components/festival/FestivalListCard";
import { currentFestivalCondition } from "@/lib/current-festivals";
import { hasSubstantiveContent } from "@/lib/festival-quality";
import { findAreaByCode } from "@/lib/regions";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ contentId: string; slug: string }>;
}

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");
const encodePathSegment = (value: string | number) =>
  encodeURIComponent(String(value));
const BODY_PARAGRAPH_CLASS =
  "text-[1rem] leading-[1.9] text-[var(--color-ink)]";
const BODY_GAP_CLASS = "mt-3 flex flex-col gap-4";
const SECTION_TITLE_CLASS = "text-lg font-semibold";
const ROUTE_ACTION_CLASS =
  "inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-surface-muted)]";

// ─────────────────────────────────────────────────────────────
// 메타데이터 (검색 결과·OG·canonical)
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { contentId } = await params;
  const festival = await getFestival(Number(contentId));
  if (!festival) return {};

  const canonical = `${SITE_URL}/festivals/${encodePathSegment(contentId)}/${encodePathSegment(festival.slug)}`;
  const period =
    festival.startDate && festival.endDate
      ? ` (${formatPeriod(festival.startDate, festival.endDate)})`
      : "";

  const title = `${festival.title}${period}`;
  const description = truncateDescription(
    cleanTourText(festival.description) ??
      cleanTourText(festival.overview) ??
      `${festival.title} 일정·장소·입장료 정보를 정리했습니다.`,
  );

  const isIndexable =
    festival.isIndexable &&
    festival.status !== "cancelled" &&
    festival.status !== "ended" &&
    hasSubstantiveContent(festival);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      // TourAPI 원본 이미지 크기는 제각각이라 width/height를 선언하지 않는다.
      images: festival.imageUrl
        ? [{ url: festival.imageUrl }]
        : [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

// ─────────────────────────────────────────────────────────────
// 페이지 본문
// ─────────────────────────────────────────────────────────────
export default async function FestivalPage({ params }: Params) {
  const { contentId, slug } = await params;
  const festival = await getFestival(Number(contentId));
  if (!festival) return notFound();

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    // Literal percent titles remain valid; malformed aliases redirect below.
  }
  if (
    (slug !== festival.slug && decodedSlug !== festival.slug) ||
    contentId !== String(festival.contentId)
  ) {
    permanentRedirect(
      `/festivals/${festival.contentId}/${encodeURIComponent(festival.slug)}`,
    );
  }
  const sourceNote = eventSourceNote(festival);
  const canonical = `${SITE_URL}/festivals/${encodePathSegment(contentId)}/${encodePathSegment(festival.slug)}`;
  const updatedAt = new Date(festival.updatedAt).toISOString();
  const overviewParagraphs = toParagraphs(festival.overview);
  const programParagraphs = toParagraphs(
    extractTourIntroProgram(festival.rawJson),
  );
  const homepageUrl = extractFirstUrl(festival.homepage ?? festival.sourceUrl);
  const playTime = operatingTime(festival);
  const address = cleanTourText(festival.address);
  const area = festival.areaCode ? findAreaByCode(festival.areaCode) : undefined;
  const areaPath = area
    ? `/regions/${encodePathSegment(area.slug)}`
    : "/regions";
  const areaLabel = area?.shortName ?? "지역별";
  const related = await getRelatedFestivals(festival);

  const breadcrumbLd = buildBreadcrumbListLd([
    { name: "홈", url: SITE_URL },
    { name: areaLabel, url: `${SITE_URL}${areaPath}` },
    { name: festival.title, url: canonical },
  ]);

  return (
    <article className="prose-ko">
      <BackToList />
      <EventSchema festival={festival} url={canonical} />
      <JsonLd id="ld-breadcrumb" data={breadcrumbLd} />

      <nav className="text-xs text-[var(--color-ink-muted)] mb-2">
        <Link href="/" className="hover:underline">
          홈
        </Link>{" "}
        ›{" "}
        <Link href={areaPath} className="hover:underline">
          {areaLabel}
        </Link>{" "}
        › <span>{festival.title}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {festival.title}
      </h1>

      {festival.address && (
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {festival.eventPlace ?? festival.address}
        </p>
      )}

      <InfoCards festival={festival} />

      <CuratorNote festival={festival} />

      {festival.imageUrl && (
        <div className="relative my-6 h-[220px] w-full overflow-hidden rounded-lg sm:h-[280px]">
          <Image
            src={festival.imageUrl}
            alt={festival.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {overviewParagraphs.length > 0 && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>행사 소개</h2>
          <div className={BODY_GAP_CLASS}>
            {overviewParagraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 16)}`}
                className={BODY_PARAGRAPH_CLASS}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {programParagraphs.length > 0 && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>프로그램</h2>
          <div className={BODY_GAP_CLASS}>
            {programParagraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 16)}`}
                className={BODY_PARAGRAPH_CLASS}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {(playTime || sourceNote?.scheduleText) && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>일정·운영 시간</h2>
          <div className={BODY_GAP_CLASS}>
            {sourceNote?.scheduleText && (
              <p className={BODY_PARAGRAPH_CLASS}>{sourceNote.scheduleText}</p>
            )}
            {playTime && !sourceNote?.programs && (
              <p className={BODY_PARAGRAPH_CLASS}>{playTime}</p>
            )}
          </div>
        </section>
      )}

      {sourceNote?.programs && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>프로그램별 장소·시간</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {sourceNote.programs.map((program) => (
              <div
                key={program.name}
                className="rounded-lg border border-[var(--color-line)] p-4"
              >
                <h3 className="font-semibold">{program.name}</h3>
                <p>{program.venue}</p>
                <p>{program.address || "상세 주소 확인 필요"}</p>
                <p>{program.time}</p>
                <p className="mt-2 text-sm">{program.notice}</p>
                {program.address && (
                  <TrackedLink
                    eventName="map_open"
                    contentId={festival.contentId}
                    href={`https://map.kakao.com/link/search/${encodeURIComponent(program.venue + " " + program.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {program.venue} 지도 검색
                  </TrackedLink>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {!sourceNote?.programs && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>가는 방법</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {address ?? "주소는 공식 발표 기준으로 확인해 주세요."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {festival.lat && festival.lng && (
              <TrackedLink
                eventName="map_open"
                contentId={festival.contentId}
                href={`https://map.kakao.com/link/map/${encodeURIComponent(festival.title)},${festival.lat},${festival.lng}`}
                className={ROUTE_ACTION_CLASS}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 4.55 6.5 12 7 12s7-7.45 7-12c0-3.87-3.13-7-7-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <path
                    d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    fill="currentColor"
                  />
                </svg>
                카카오맵 보기
              </TrackedLink>
            )}
            {festival.tel && (
              <a href={`tel:${festival.tel}`} className={ROUTE_ACTION_CLASS}>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3 5.5A2 2 0 0 1 5 3h2.38a1.5 1.5 0 0 1 1.5 1.25l.45 2.55a1.5 1.5 0 0 1-.84 1.58L6.8 8.9a12.01 12.01 0 0 0 8.3 8.3l.52-1.23a1.5 1.5 0 0 1 1.58-.84L19.75 17a1.5 1.5 0 0 1 1.25 1.5V21a2 2 0 0 1-2 2h-1C10.5 23 1 13.5 1 2h-.5A2 2 0 0 1 3 0h3.5a1.5 1.5 0 0 1 1.5 1.25l.55 2.5a1.5 1.5 0 0 1-.84 1.73L6.8 6.1A18.3 18.3 0 0 1 17.9 17.2l.82-1.13a1.5 1.5 0 0 1 1.73-.84L23.95 16a1.5 1.5 0 0 1 1.25 1.5V21a2 2 0 0 1-2 2H21z"
                    fill="currentColor"
                  />
                </svg>
                문의하기
              </a>
            )}
          </div>
        </section>
      )}

      {(sourceNote?.sourceUrl || homepageUrl) && (
        <section>
          <h2>{sourceNote?.label ?? "공식 안내·원자료"}</h2>
          <p className="text-sm break-all">
            <TrackedLink
              eventName="official_link_open"
              contentId={festival.contentId}
              href={sourceNote?.sourceUrl ?? homepageUrl ?? undefined}
              className="text-[var(--color-brand)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {sourceNote?.label ?? "안내 자료 확인하기"}
            </TrackedLink>
          </p>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className={SECTION_TITLE_CLASS}>
            {area ? `${area.shortName}에서 함께 볼 만한 행사` : "함께 볼 만한 행사"}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {related.map((item) => (
              <FestivalListCard
                key={item.contentId}
                festival={item}
                href={`/festivals/${item.contentId}/${encodeURIComponent(item.slug)}`}
                titleLevel="h3"
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            ))}
          </ul>
          {area && (
            <p className="mt-4 text-sm">
              <Link
                href={areaPath}
                className="text-[var(--color-brand)] hover:underline"
              >
                {area.shortName} 축제·행사 전체 보기
              </Link>
            </p>
          )}
        </section>
      )}

      <hr className="my-8 border-[var(--color-line)]" />

      <footer className="text-xs text-[var(--color-ink-muted)] space-y-1">
        <p>
          <strong>기본 데이터 출처</strong>: 한국관광공사 TourAPI ·{" "}
          <strong>데이터 변경 기록</strong>:{" "}
          <time dateTime={updatedAt}>{updatedAt.slice(0, 10)}</time>
        </p>
        {festival.syncedAt && (
          <p>
            최근 수집:{" "}
            <time dateTime={festival.syncedAt.toISOString()}>
              {festival.syncedAt.toISOString().slice(0, 10)}
            </time>{" "}
            · 자동 수집은 사람의 검수를 뜻하지 않습니다.
          </p>
        )}
        {sourceNote && (
          <p>
            공식 자료 대조일: {sourceNote.checkedAt} · 대상:{" "}
            {sourceNote.checkedFields}. 현장 운영 확인은 아닙니다.
          </p>
        )}
        <p>
          행사 정보는 변경·취소될 수 있어요. 방문 전에 공식 홈페이지나 주최 측
          연락처로 다시 한번 확인하시면 좋습니다.
        </p>
        <p>
          출발 전 참고:{" "}
          <Link
            href="/guides/festival-cancellation-check"
            className="underline"
          >
            취소·연기 확인 순서
          </Link>{" "}
          ·{" "}
          <Link href="/guides/how-to-read-festival-info" className="underline">
            이 페이지 정보 읽는 법
          </Link>
        </p>
      </footer>
      <PageAds
        eligible={Boolean(
          festival.overview ||
          festival.description ||
          (festival.startDate && festival.address),
        )}
      />
    </article>
  );
}

const MAX_DESCRIPTION_CHARS = 155;

function truncateDescription(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > MAX_DESCRIPTION_CHARS
    ? `${flat.slice(0, MAX_DESCRIPTION_CHARS - 1).trimEnd()}…`
    : flat;
}

const RELATED_LIMIT = 6;

/** 같은 시도의 현재 진행·예정 행사. 같은 시군구를 먼저, 그다음 시작일 순. */
async function getRelatedFestivals(festival: {
  contentId: number;
  areaCode: string | null;
  sigunguCode: string | null;
}) {
  if (!festival.areaCode) return [];
  return db
    .select({
      contentId: festivals.contentId,
      slug: festivals.slug,
      title: festivals.title,
      startDate: festivals.startDate,
      endDate: festivals.endDate,
      address: festivals.address,
      imageUrl: festivals.imageUrl,
      status: festivals.status,
      rawJson: festivals.rawJson,
      playTime: festivals.playTime,
    })
    .from(festivals)
    .where(
      and(
        currentFestivalCondition(),
        eq(festivals.areaCode, festival.areaCode),
        ne(festivals.contentId, festival.contentId),
      ),
    )
    .orderBy(
      sql`case when ${festivals.sigunguCode} = ${festival.sigunguCode ?? ""} then 0 else 1 end`,
      asc(festivals.startDate),
    )
    .limit(RELATED_LIMIT);
}

const getFestival = cache(async (contentId: number) => {
  if (!Number.isSafeInteger(contentId) || contentId <= 0) return null;
  const rows = await db
    .select()
    .from(festivals)
    .where(eq(festivals.contentId, contentId))
    .limit(1);
  return rows[0] ? { ...rows[0], ...festivalPeriod(rows[0]) } : null;
});
