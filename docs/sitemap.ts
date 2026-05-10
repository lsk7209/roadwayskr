import type { MetadataRoute } from "next";
import { db, festivals } from "@/db";
import { eq } from "drizzle-orm";
import { AREAS } from "@/lib/regions";

const SITE_URL = process.env.SITE_URL ?? "https://gogotrip.kr";

/**
 * Next.js 동적 sitemap.
 *
 * 정책:
 * - 정적 페이지: 고정 lastmod (배포 시각)
 * - 행사 페이지: festivals.updatedAt (실제 데이터 변경 시각)
 *   → Scaled Content Abuse 검출 회피를 위해 모든 페이지가 같은 시각이 되지 않도록 강제
 * - isIndexable=false 항목은 제외
 *
 * 단일 sitemap이 5만 URL/50MB 초과하면 분할 필요. 현재는 단일로 충분.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/이번주말`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/지역`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about/curator`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/data-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 시도 허브 17개 (URL은 한글 그대로 두되, 클라이언트 호환을 위해 인코딩)
  const areaPages: MetadataRoute.Sitemap = AREAS.map((a) => ({
    url: `${SITE_URL}/지역/${encodeURIComponent(a.slug)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 행사 상세 페이지 - DB에서 indexable한 항목만
  let festivalPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({
        contentId: festivals.contentId,
        slug: festivals.slug,
        updatedAt: festivals.updatedAt,
      })
      .from(festivals)
      .where(eq(festivals.isIndexable, true))
      .limit(45_000); // sitemap 한도 보호

    festivalPages = rows.map((f) => ({
      url: `${SITE_URL}/축제/${f.contentId}/${encodeURIComponent(f.slug)}`,
      lastModified: f.updatedAt, // 실제 데이터 변경 시각 (lastmod 분산)
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB 없거나 마이그레이션 전이면 행사 페이지는 건너뜀
  }

  return [...staticPages, ...areaPages, ...festivalPages];
}
