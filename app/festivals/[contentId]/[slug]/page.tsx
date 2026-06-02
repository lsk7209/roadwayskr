import { db, festivals } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
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

interface Params {
  params: Promise<{ contentId: string; slug: string }>;
}

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");
const encodePathSegment = (value: string | number) =>
  encodeURIComponent(String(value));
const BODY_PARAGRAPH_CLASS =
  "text-[1rem] leading-[1.9] text-[var(--color-ink)]";
const BODY_GAP_CLASS = "mt-3 flex flex-col gap-4";
const SECTION_TITLE_CLASS = "text-lg font-semibold";
const ROUTE_ACTION_CLASS =
  "inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-surface-muted)]";

// ─────────────────────────────────────────────────────────────
// SSG 대상 contentId 사전 추출 (단, 가치 미달 페이지는 제외)
// ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const rows = await db
    .select({ contentId: festivals.contentId, slug: festivals.slug })
    .from(festivals)
    .where(eq(festivals.isIndexable, true))
    .limit(5_000); // 빌드 시간 한도 고려, 점진 확장

  return rows.map((r) => ({
    contentId: String(r.contentId),
    slug: r.slug,
  }));
}

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
      ? ` (${festival.startDate} ~ ${festival.endDate})`
      : "";

  const title = `${festival.title}${period}`;
  const description =
    cleanTourText(festival.description) ??
    `${festival.title} 일정·장소·입장료·주차 정보를 한눈에 정리했습니다.`;

  const isIndexable = festival.isIndexable && festival.status !== "cancelled";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: festival.imageUrl
        ? [{ url: festival.imageUrl, width: 1200, height: 630 }]
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
  const { contentId } = await params;
  const festival = await getFestival(Number(contentId));
  if (!festival) return notFound();

  // 슬러그 불일치 시 canonical 보호 - 정식 슬러그로 안내 (Next 15 redirect는 별도 처리 권장)
  const canonical = `${SITE_URL}/festivals/${encodePathSegment(contentId)}/${encodePathSegment(festival.slug)}`;
  const updatedAt = new Date(festival.updatedAt).toISOString();
  const overviewParagraphs = toParagraphs(festival.overview);
  const programParagraphs = toParagraphs(
    extractTourIntroProgram(festival.rawJson),
  );
  const homepageUrl = extractFirstUrl(festival.homepage ?? festival.sourceUrl);
  const useTime = cleanTourText(festival.useTime);
  const playTime = cleanTourText(festival.playTime);
  const address = cleanTourText(festival.address);

  const breadcrumbLd = buildBreadcrumbListLd([
    { name: "홈", url: SITE_URL },
    { name: "지역별", url: `${SITE_URL}/regions` },
    { name: festival.title, url: canonical },
  ]);

  return (
    <article className="prose-ko">
      <EventSchema festival={festival} url={canonical} />
      <JsonLd id="ld-breadcrumb" data={breadcrumbLd} />

      <nav className="text-xs text-[var(--color-ink-muted)] mb-2">
        <Link href="/" className="hover:underline">
          홈
        </Link>{" "}
        ›{" "}
        <Link href="/regions" className="hover:underline">
          지역별
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

      {(useTime || playTime) && (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>일정·운영 시간</h2>
          <div className={BODY_GAP_CLASS}>
            {useTime && <p className={BODY_PARAGRAPH_CLASS}>{useTime}</p>}
            {playTime && playTime !== useTime && (
              <p className={BODY_PARAGRAPH_CLASS}>{playTime}</p>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className={SECTION_TITLE_CLASS}>가는 방법</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          {address ?? "주소는 공식 발표 기준으로 확인해 주세요."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {festival.lat && festival.lng && (
            <a
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
            </a>
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

      {homepageUrl && (
        <section>
          <h2>공식 홈페이지</h2>
          <p className="text-sm break-all">
            <a
              href={homepageUrl}
              className="text-[var(--color-brand)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              공식 사이트에서 최신 공지 확인하기
            </a>
          </p>
        </section>
      )}

      <hr className="my-8 border-[var(--color-line)]" />

      <footer className="text-xs text-[var(--color-ink-muted)] space-y-1">
        <p>
          <strong>데이터 출처</strong>: 한국관광공사 TourAPI ·{" "}
          <strong>마지막 업데이트</strong>:{" "}
          <time dateTime={updatedAt}>{updatedAt.slice(0, 10)}</time>
        </p>
        <p>
          행사 정보는 변경·취소될 수 있어요. 방문 전에 공식 홈페이지나 주최 측
          연락처로 다시 한번 확인하시면 좋습니다.
        </p>
      </footer>
    </article>
  );
}

async function getFestival(contentId: number) {
  if (!Number.isFinite(contentId)) return null;
  const rows = await db
    .select()
    .from(festivals)
    .where(eq(festivals.contentId, contentId))
    .limit(1);
  return rows[0] ?? null;
}
