import { db, festivals } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

import { InfoCards } from "@/components/festival/InfoCards";
import { EventSchema } from "@/components/festival/EventSchema";
import { CuratorNote } from "@/components/festival/CuratorNote";
import {
  cleanTourText,
  extractFirstUrl,
  extractTourIntroProgram,
  toParagraphs,
} from "@/lib/content";

interface Params {
  params: Promise<{ contentId: string; slug: string }>;
}

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

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
  const { contentId, slug } = await params;
  const festival = await getFestival(Number(contentId));
  if (!festival) return {};

  const canonical = `${SITE_URL}/festivals/${contentId}/${slug}`;
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
      images: festival.imageUrl ? [{ url: festival.imageUrl }] : undefined,
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
  const canonical = `${SITE_URL}/festivals/${contentId}/${festival.slug}`;
  const updatedAt = new Date(festival.updatedAt).toISOString();
  const overviewParagraphs = toParagraphs(festival.overview);
  const programParagraphs = toParagraphs(
    extractTourIntroProgram(festival.rawJson),
  );
  const homepageUrl = extractFirstUrl(festival.homepage ?? festival.sourceUrl);
  const useTime = cleanTourText(festival.useTime);
  const playTime = cleanTourText(festival.playTime);
  const address = cleanTourText(festival.address);

  return (
    <article className="prose-ko">
      <EventSchema festival={festival} url={canonical} />

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
          <h2>행사 소개</h2>
          {overviewParagraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
          ))}
        </section>
      )}

      {programParagraphs.length > 0 && (
        <section>
          <h2>프로그램</h2>
          {programParagraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
          ))}
        </section>
      )}

      {(useTime || playTime) && (
        <section>
          <h2>일정·운영 시간</h2>
          {useTime && <p>{useTime}</p>}
          {playTime && playTime !== useTime && <p>{playTime}</p>}
        </section>
      )}

      <section>
        <h2>가는 방법</h2>
        <p>
          {address ?? "주소는 공식 발표 기준으로 확인해 주세요."}
          {festival.lat && festival.lng && (
            <>
              {" "}
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(festival.title)},${festival.lat},${festival.lng}`}
                className="text-[var(--color-brand)] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                카카오맵에서 보기
              </a>
            </>
          )}
        </p>
        {festival.tel && (
          <p className="text-sm text-[var(--color-ink-muted)]">
            문의: {festival.tel}
          </p>
        )}
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
