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
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Yeti", allow: "/" },
      { userAgent: "Daumoa", allow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
