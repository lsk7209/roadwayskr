import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://gogotrip.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 검색 결과·관리 경로는 색인 차단 (필요 시 확장)
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      // AI 크롤러는 차별 정책. 학습용 크롤은 차단, 검색·요약용은 허용.
      // (추후 정책 변경 가능)
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "ClaudeBot", allow: "/" }, // 검색·요약용
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
