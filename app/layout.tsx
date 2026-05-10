import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import { AutoAds } from "@/components/ads/AutoAds";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const NAVER_VERIFICATION =
  process.env.NAVER_VERIFICATION ?? "ce71e583d5763935ec467df1eba2d290d9552ae0";
const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION ?? "nS4LR8kOtTWrOVd6mtEwxiSyF457vBKjcVeMuGRua3Y";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ??
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

const SITE_NAME = "여행고고";
const SITE_DESCRIPTION =
  "전국 축제와 행사 정보를 지역, 일정, 테마 기준으로 정리하는 여행 큐레이션 서비스입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 전국 축제·행사 큐레이션`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["축제", "행사", "이번주말", "가족 나들이", "주말 여행", "지역 축제"],
  applicationName: SITE_NAME,
  authors: [{ name: "고고지기", url: `${SITE_URL}/about/curator` }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 전국 축제·행사 큐레이션`,
    description: "이번 주말, 우리 동네 축제와 행사를 빠르고 정확하게 확인하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "전국 축제·행사 큐레이션",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  other: {
    "naver-site-verification": NAVER_VERIFICATION,
    "google-site-verification": GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
  };
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko-KR">
      <head>
        <JsonLd id="organization-jsonld" data={orgSchema} />
        <JsonLd id="website-jsonld" data={webSiteSchema} />
        {ADSENSE_PUBLISHER_ID ? (
          <meta name="google-adsense-account" content={ADSENSE_PUBLISHER_ID} />
        ) : null}
      </head>
      <body>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
        <AutoAds publisherId={ADSENSE_PUBLISHER_ID} />
        <header className="border-b border-[var(--color-line)] bg-[var(--color-card)]">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              여행<span className="text-[var(--color-brand)]">고고</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-[var(--color-ink-muted)]">
              <Link href="/weekend" className="hover:text-[var(--color-ink)]">
                이번 주말
              </Link>
              <Link href="/regions" className="hover:text-[var(--color-ink)]">
                지역별
              </Link>
              <Link href="/themes" className="hover:text-[var(--color-ink)]">
                테마별
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-[var(--color-line)] bg-[var(--color-card)] py-8">
          <div className="mx-auto max-w-6xl space-y-2 px-4 text-sm text-[var(--color-ink-muted)]">
            <p>
              <strong className="text-[var(--color-ink)]">여행고고</strong> ·
              큐레이터{" "}
              <Link href="/about/curator" className="underline underline-offset-2">
                고고지기
              </Link>
            </p>
            <p>
              데이터 출처: 한국관광공사 TourAPI. 변경·취소 정보는 수집 주기에 따라
              반영됩니다.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/about" className="hover:underline">
                소개
              </Link>
              <Link href="/contact" className="hover:underline">
                문의
              </Link>
              <Link href="/privacy" className="hover:underline">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:underline">
                이용약관
              </Link>
              <Link href="/data-policy" className="hover:underline">
                데이터 정책
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
