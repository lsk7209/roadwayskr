import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

export const metadata: Metadata = {
  title: "플랜 메뉴",
  description:
    "여행고고의 주간 축제 큐레이션 전략을 한눈에 보는 페이지입니다. 속도·SEO·콘텐츠·수익화 개선 상태를 확인하세요.",
  alternates: { canonical: `${SITE_URL}/plan` },
};

const plans = [
  {
    title: "사이트 속도 최적화",
    href: "/weekend",
    items: [
      "캐시 재검토(CDN/정적 페이지 재생성 주기)",
      "이미지 WebP·AVIF, LCP 우선 노출 대상 점검",
    ],
    note: "중복 라우트 제거로 렌더링 경로를 단일화했습니다.",
  },
  {
    title: "SEO/콘텐츠 최적화",
    href: "/about/curator",
    items: [
      "페이지별 메타/OG/정식 canonical 점검",
      "h1 구조와 내부·외부 링크 체계 분기 정리",
    ],
    note: "sitemap lastmod는 최근 데이터 기반으로 갱신됩니다.",
  },
  {
    title: "AdSense·수익화",
    href: "/terms",
    items: [
      "페이지 상단·중간·하단 광고 원칙(과다 배치 금지)",
      "AutoAds 스크립트로 자동광고 적용 상태 검증",
    ],
    note: "광고 노출과 UX 충돌 지점은 리스크 리스트로 추적합니다.",
  },
  {
    title: "운영 점검",
    href: "/data-policy",
    items: [
      "404/빈 페이지, 410 가능 페이지 점검",
      "robots, robots 허용 봇/차단 봇 정책 정합성 확인",
    ],
    note: "검색엔진 제출은 자동 알림 흐름(ping/IndexNow)을 함께 운영합니다.",
  },
];

export default function PlanPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-brand)]">PLAN</p>
        <h1 className="mt-2 text-2xl font-bold">플랜 메뉴 상세</h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-ink-muted)] leading-relaxed">
          메뉴별 운영 상태를 중심으로 문제를 수치/체크리스트 기반으로 정리합니다.
          이상 페이지는 즉시 분리하고, 정상 페이지는 검수 통과 기준에 맞게
          반복 보강합니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.title}
            className="rounded-xl border border-[var(--color-line)] bg-white p-5"
          >
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
              {plan.items.map((item) => (
                <li key={item} className="list-disc list-inside">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">{plan.note}</p>
            <div className="mt-4">
              <Link href={plan.href} className="text-sm text-[var(--color-brand)] hover:underline">
                관련 상세 보기 →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
        <h2 className="text-lg font-bold">메뉴별 빠른 이동</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/weekend" className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm">
            이번주말
          </Link>
          <Link href="/regions" className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm">
            지역별
          </Link>
          <Link href="/themes" className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm">
            테마별
          </Link>
          <Link href="/about/curator" className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm">
            운영 정책
          </Link>
        </div>
      </section>
    </div>
  );
}
