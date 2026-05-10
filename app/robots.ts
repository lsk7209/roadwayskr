import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const ROBOTS_RULE_INDEX = ["/"];

export default function robots(): MetadataRoute.Robots {
  const headerList = headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "roadways.kr";
  const scheme = headerList.get("x-forwarded-proto") ?? "https";
  const SITE_URL = `${scheme}://${host}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ROBOTS_RULE_INDEX,
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
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
    host: SITE_URL,
  };
}
