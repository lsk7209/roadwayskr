import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const NAVER_VERIFICATION =
  process.env.NAVER_VERIFICATION ?? "ce71e583d5763935ec467df1eba2d290d9552ae0";
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-MH1JSZH1XG";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "여행고고 - 전국 축제·행사 큐레이션",
    template: "%s | 여행고고",
  },
  description:
    "전국 17개 시도 축제·행사 정보를 가족 단위 시점으로 큐레이션합니다. 거리·운영시간·입장료·주차 4대 기본 정보를 항상 정리합니다.",
  keywords: ["축제", "행사", "이번주말", "가족 나들이", "주말 여행", "지역 축제"],
  applicationName: "여행고고",
  authors: [{ name: "고고지기", url: `${SITE_URL}/about/curator` }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "여행고고",
    title: "여행고고 - 전국 축제·행사 큐레이션",
    description:
      "이번 주말, 우리 동네 축제·행사를 가장 빠르고 정확하게.",
  },
  twitter: {
    card: "summary_large_image",
    title: "여행고고",
    description: "전국 축제·행사 큐레이션",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  other: {
    "naver-site-verification": NAVER_VERIFICATION,
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
  // Organization Schema (사이트 전역)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "여행고고",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "전국 축제·행사 정보를 가족 단위 시점으로 큐레이션하는 여행 미디어",
  };

  return (
    <html lang="ko-KR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>
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
        <header className="border-b border-[var(--color-line)] bg-[var(--color-card)]">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="font-bold tracking-tight text-lg">
              여행<span className="text-[var(--color-brand)]">고고</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-[var(--color-ink-muted)]">
              <Link href="/이번주말" className="hover:text-[var(--color-ink)]">
                이번 주말
              </Link>
              <Link href="/지역" className="hover:text-[var(--color-ink)]">
                지역별
              </Link>
              <Link href="/테마" className="hover:text-[var(--color-ink)]">
                테마별
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="border-t border-[var(--color-line)] bg-[var(--color-card)] py-8 mt-16">
          <div className="mx-auto max-w-5xl px-4 text-sm text-[var(--color-ink-muted)] space-y-2">
            <p>
              <strong className="text-[var(--color-ink)]">여행고고</strong> ·
              큐레이터{" "}
              <Link
                href="/about/curator"
                className="underline underline-offset-2"
              >
                고고지기
              </Link>
            </p>
            <p>
              데이터 출처: 한국관광공사 TourAPI (Open API). 변경·취소 정보는 24시간
              내 반영합니다.
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
