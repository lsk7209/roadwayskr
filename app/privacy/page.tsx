import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "Roadways의 개인정보 처리 범위와 보관, 보안, 문의 절차를 안내합니다.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-05-10";

export default function PrivacyPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">개인정보 처리방침</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">최종 갱신: {LAST_UPDATED}</p>

      <h2>1. 수집 항목</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>필수: 접속 IP, 브라우저 UA(서비스 보안 목적)</li>
        <li>선택: 문의 페이지 입력 데이터(이메일, 메시지)</li>
        <li>자동 수집: 성능 분석을 위한 집계 데이터</li>
      </ul>

      <h2>2. 이용 목적</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>서비스 운영 및 품질 개선</li>
        <li>보안 사고 대응 및 악성 접근 차단</li>
        <li>통계 분석 및 기능 개선</li>
      </ul>

      <h2>3. 보관 기간</h2>
      <p>
        관련 법령 및 내부 정책을 준수하며, 분석 데이터는 24개월 이내 또는 법정 보관기간에 맞추어
        처리 후 삭제합니다.
      </p>

      <h2>4. 제3자 제공</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Google Analytics: 방문 분석</li>
        <li>Google AdSense: 광고 품질 및 과금 연동</li>
        <li>클라우드 인프라 제공자: 서비스 운영 용도</li>
      </ul>

      <h2>5. 사용권한 철회</h2>
      <p>
        사용자는 언제든 개인정보 삭제·정정·이용 중단을 요청할 수 있습니다. 문의 채널을 통해 요청해
        주세요.
      </p>

      <h2>6. 문의</h2>
      <p>
        개인정보 관련 문의:{" "}
        <a className="underline" href="mailto:privacy@roadways.kr">
          privacy@roadways.kr
        </a>
      </p>
    </article>
  );
}
