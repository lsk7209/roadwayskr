import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description:
    "Roadways의 개인정보 처리 범위와 보관, 보안, 문의 절차를 안내합니다.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-09-20";

export default function PrivacyPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">개인정보 처리방침</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        최종 갱신: {LAST_UPDATED}
      </p>

      <h2>1. 수집 항목</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          접속 과정에서 IP·브라우저 정보가 호스팅 및 광고 서비스에 전달될 수
          있습니다.
        </li>
        <li>
          문의는 이메일 링크를 통해 접수하며, 보낸 이메일 주소와 문의 내용을
          처리합니다. 사이트 내 입력 폼은 없습니다.
        </li>
        <li>
          방문 분석이 활성화된 경우 페이지 조회와 기능 사용 정보를 처리합니다.
        </li>
      </ul>

      <h2>2. 이용 목적</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>서비스 운영 및 품질 개선</li>
        <li>보안 사고 대응 및 악성 접근 차단</li>
        <li>통계 분석 및 기능 개선</li>
      </ul>

      <h2>3. 보관 기간</h2>
      <p>
        문의·분석 정보의 구체적인 보관기간과 삭제 절차는 운영자 확인이
        필요합니다. 개인정보 문의 채널로 현재 처리 기준을 요청할 수 있습니다.
      </p>

      <h2>4. 제3자 제공</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Google Analytics: 설정된 경우 방문 분석 및 지도·안내 링크 이용 집계
        </li>
        <li>Google AdSense: 광고 품질 및 과금 연동</li>
        <li>호스팅 서비스: 페이지 제공 및 접속 처리</li>
        <li>
          쿠팡 파트너스 및 배너 제공 서비스: 제휴 배너 표시와 클릭 연결. 배너를
          불러올 때 페이지 주소와 접속 정보가 전달될 수 있습니다.
        </li>
      </ul>
      <p>
        Google을 비롯한 제3자 공급업체는 쿠키(예: DoubleClick DART 쿠키)를
        사용하며, Google과 파트너는 이 사이트 및 다른 사이트의 이전 방문 기록을
        기반으로 맞춤 광고를 게재할 수 있습니다. 사용자는 브라우저 설정에서
        쿠키를 차단하거나{" "}
        <a
          className="underline"
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noreferrer"
        >
          Google 광고 설정
        </a>
        에서 맞춤 광고를 비활성화할 수 있습니다.
      </p>

      <h2>5. 사용권한 철회</h2>
      <p>
        사용자는 언제든 개인정보 삭제·정정·이용 중단을 요청할 수 있습니다. 문의
        채널을 통해 요청해 주세요.
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
