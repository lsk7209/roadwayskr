import type { MetadataRoute } from "next";

const ROBOTS_RULE_INDEX = ["/"];

/**
 * The request Host/X-Forwarded-Host header is client-controlled. Building
 * robots.txt's sitemap/host fields from it verbatim would let a spoofed
 * header point search engines at an attacker-controlled domain. Instead we
 * always use the operator-configured SITE_URL, which matches the
 * canonical/JSON-LD/sitemap URLs used elsewhere in the app.
 */
const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ROBOTS_RULE_INDEX,
        // /_next/ 는 next.config.ts에서 장기 캐시 헤더를 설정하는 실제 공개 렌더링 리소스 경로라 차단하지 않는다.
        // 검색 결과·관리 경로만 색인 차단 (필요 시 확장)
        disallow: ["/api/", "/admin/"],
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
