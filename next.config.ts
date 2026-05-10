import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // TourAPI 이미지 호스트 + 일반적인 한국 관광 이미지 서버
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "korean.visitkorea.or.kr" },
      { protocol: "https", hostname: "cdn.visitkorea.or.kr" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // 한글 URL 인식 + canonical 일관성
  trailingSlash: false,

  // 빌드 시 페이지 가치 미달 셀은 noindex로 처리 (런타임에서)
  poweredByHeader: false,

  experimental: {
    // 한글 URL 인코딩 일관성
    optimizePackageImports: ["drizzle-orm"],
  },

  // sitemap.xml, robots.txt 같은 정적 자산 캐싱
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
