import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "최적화 실행 PLAN",
  description:
    "Roadways.kr의 속도·SEO·콘텐츠·광고·인덱싱 상태를 점검하고 개선하기 위한 실행 플랜 페이지입니다.",
  alternates: { canonical: `${SITE_URL}/plan` },
};

const actionPlans = [
  {
    title: "속도 최적화",
    status: "진행",
    items: [
      "이미지 WebP/AVIF 최적화 및 LCP 이미지 우선순위 조정",
      "불필요한 JS 분할 로딩, 정적 데이터 캐시 TTL 정리",
      "메뉴/필터 API 호출은 1초당 중복 호출 제한",
      "긴 목록 구간에 content-visibility 적용으로 초기 렌더링 축소",
    ],
    result: "로딩 시간 감소, 사용자 이탈률 완화, Core Web Vitals 개선",
  },
  {
    title: "SEO 최적화",
    status: "진행",
    items: [
      "메타 제목/설명/정규 URL 통일 점검 및 중복 텍스트 정리",
      "JSON-LD 구조화 데이터 누락 페이지 보완(Organization, WebSite 중심)",
      "robots 규칙 정비(허용 봇/차단 봇 분리)",
      "sitemap/feed 생성 파라미터와 lastModified 최신성 점검",
    ],
    result: "색인 속도 향상, 검색 노출 제어력 강화, 검색 노이즈 감소",
  },
  {
    title: "콘텐츠 최적화",
    status: "계획",
    items: [
      "메인/주제 페이지 핵심 문안 정비(문단 가독성 기준 통일)",
      "중요 키워드 하단 FAQ 섹션으로 정보 탐색 효율 강화",
      "메뉴별 빈 페이지 유무 점검(권장 2개 이상 내부 링크 포함)",
    ],
    result: "사용자 체류 시간 증가, AI 검색 인용 가능성 개선",
  },
  {
    title: "AdSense / 수익화",
    status: "점검",
    items: [
      "자동광고 방식 규정 충돌 항목 제거(과도한 광고 배치 금지)",
      "본문과 광고의 간격/비율 균형(가독성 우선) 적용",
      "앵커/버튼 문안이 사용자 유도형(클릭 유도 과다 문구 제외)",
      "광고 스크립트 주입 지연/중복 로딩 중복 제거",
    ],
    result: "검수 통과 가능성 향상, 사용자 경험 손상 최소화",
  },
];

const checkList = [
  { label: "사이트맵", path: "/sitemap.xml", tip: "최신 lastmod 존재 여부 우선 확인" },
  { label: "RSS", path: "/feed.xml", tip: "정상 XML 형식과 최신성 확인" },
  { label: "robots", path: "/robots.txt", tip: "허용/차단 봇 정책 정합성 점검" },
  { label: "테마 페이지", path: "/themes", tip: "썸네일/카드 텍스트 깨짐 없음" },
  { label: "지역 페이지", path: "/regions", tip: "빈 페이지/깨진 링크 제거" },
];

const quickMenus = [
  { title: "주말 행사", href: "/weekend" },
  { title: "지역 별 일정", href: "/regions" },
  { title: "테마 별 추천", href: "/themes" },
  { title: "큐레이터 소개", href: "/about/curator" },
];

export default function PlanPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-float)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          최적화 진행 현황
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--color-ink)]">
          Roadways 최적화 플랜
        </h1>
        <p className="mt-3 max-w-3xl text-[1.04rem] leading-8 tracking-[0.005em] text-[var(--color-ink-muted)]">
          이 페이지는 운영 개선의 기준점을 정리하고, 각 페이지의 상태를 한 번에 점검할 수 있게 설계한
          실행 페이지입니다. 목표는 “빠른 로딩 + 안정적 검색 노출 + 광고 검수 통과 + 콘텐츠 신뢰도”입니다.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {actionPlans.map((plan) => (
          <article
            key={plan.title}
            className="rounded-2xl border border-[var(--color-line)] bg-white p-5 transition hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">{plan.title}</h2>
              <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
                {plan.status}
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-[1.02rem] leading-8 text-[var(--color-ink-muted)]">
              {plan.items.map((item) => (
                <li key={item} className="list-disc list-inside">
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-[var(--color-line-soft)] pt-4 text-sm leading-7 text-[var(--color-ink)]">
              기대결과: {plan.result}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6">
        <h2 className="text-xl font-bold">빠른 점검 항목</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checkList.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="rounded-xl border border-[var(--color-line)] p-4 transition hover:border-[var(--color-brand)]"
            >
              <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
              <p className="mt-1 text-sm leading-7 text-[var(--color-ink-muted)]">{item.tip}</p>
              <p className="mt-2 text-xs text-[var(--color-brand)]">점검하러 가기</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <h2 className="text-xl font-bold">메인페이지 개선 포인트</h2>
        <p className="mt-3 max-w-3xl text-[1.04rem] leading-8 text-[var(--color-ink-muted)]">
          랜딩 텍스트는 1차 방문자가 첫 5초 안에 주제를 이해하게, 카드형 목록은 2차 탐색으로 이어지게
          구성합니다. 광고는 콘텐츠보다 앞서지 않게 배치해 체류 시간 손실을 방지합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickMenus.map((menu) => (
            <Link
              key={menu.title}
              href={menu.href}
              className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-brand)]"
            >
              {menu.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6">
        <h2 className="text-xl font-bold">다음 실행 (우선순위)</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[1.04rem] leading-8 text-[var(--color-ink-muted)]">
          <li>도메인 라우팅 문제 해결 후 사이트맵/robots/feed/page 노출 재확인</li>
          <li>댓글 모듈 미포함 상태를 정책 반영 문서화(비노출 페이지는 작성 차단)</li>
          <li>GA4 이벤트(CTA, 지도 열람, 페이지 체류) 최소 5개 표준 이벤트 정합성</li>
          <li>GSC/네이버/다음 인덱싱 제출 후 오탐 로그 점검</li>
        </ol>
      </section>
    </div>
  );
}
