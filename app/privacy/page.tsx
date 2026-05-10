import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "여행고고 개인정보처리방침. 수집 항목·이용 목적·보유 기간·이용자의 권리 등을 안내합니다.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-05-08";

export default function PrivacyPage() {
  return (
    <article className="prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        최종 갱신일: {LAST_UPDATED}
      </p>

      <p>
        여행고고(이하 &lsquo;사이트&rsquo;)는 「개인정보 보호법」에 따라 이용자의
        개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수
        있도록 다음과 같이 처리방침을 수립·공개합니다.
      </p>

      <h2>1. 수집하는 개인정보 항목</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>문의 시</strong>: 이메일 주소, 문의 내용 (이용자가 직접 제공)
        </li>
        <li>
          <strong>자동 수집</strong>: IP 주소, 쿠키, 브라우저 종류, 접속 시간,
          서비스 이용 기록, 기기 식별 정보
        </li>
        <li>
          <strong>알림 구독 시 (2차 단계 예정)</strong>: 웹푸시 엔드포인트,
          이메일 주소, 카카오 알림톡 발송용 휴대전화 번호
        </li>
      </ul>

      <h2>2. 개인정보의 처리 목적</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>문의 답변</li>
        <li>사이트 이용 통계 분석 (Google Analytics)</li>
        <li>광고 게재 및 광고 효율 측정 (Google AdSense)</li>
        <li>알림 구독 서비스 제공 (2차 단계)</li>
        <li>부정 이용 방지 및 분쟁 대응</li>
      </ul>

      <h2>3. 개인정보의 보유 및 이용 기간</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>문의: 답변 완료 후 1년</li>
        <li>알림 구독 정보: 구독 해지 시 즉시 삭제</li>
        <li>자동 수집 정보: 30일 ~ 26개월 (Google 정책 기준)</li>
        <li>관련 법령에 의한 보존: 「전자상거래법」 등 관계 법령 기준</li>
      </ul>

      <h2>4. 제3자 제공</h2>
      <p>
        본 사이트는 다음의 경우 외에는 이용자의 개인정보를 제3자에게 제공하지
        않습니다.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령에 의거 수사기관의 요청이 있는 경우</li>
      </ul>

      <h2>5. 처리 위탁</h2>
      <p>본 사이트는 서비스 운영을 위해 다음 업체에 처리를 위탁합니다.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Vercel Inc.</strong> — 웹 호스팅·CDN
        </li>
        <li>
          <strong>Turso (ChiselStrike, Inc.)</strong> — 데이터베이스
        </li>
        <li>
          <strong>Google LLC</strong> — Google Analytics, Google AdSense
        </li>
      </ul>

      <h2>6. 쿠키 사용</h2>
      <p>
        본 사이트는 서비스 제공을 위해 다음 쿠키를 사용합니다. 쿠키 거부는
        브라우저 설정에서 가능하며, 거부 시 일부 기능이 제한될 수 있습니다.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Google Analytics — 사이트 이용 통계 수집</li>
        <li>Google AdSense — 광고 개인화 및 효율 측정</li>
      </ul>

      <h2>7. 이용자의 권리</h2>
      <p>
        이용자는 언제든지 본인의 개인정보를 열람·정정·삭제·처리정지를 요구할 수
        있습니다. 요청은{" "}
        <a className="underline" href="/contact">
          문의 페이지
        </a>
        를 통해 접수하시면 영업일 기준 3일 이내 처리합니다.
      </p>

      <h2>8. 미성년자 보호</h2>
      <p>
        본 사이트는 만 14세 미만 아동의 개인정보를 직접 수집하지 않습니다.
        보호자의 도움 없이 만 14세 미만 아동이 개인정보를 제공한 사실을 인지한
        경우 즉시 해당 정보를 삭제합니다.
      </p>

      <h2>9. 개인정보 보호책임자</h2>
      <p>
        이메일:{" "}
        <a
          className="text-[var(--color-brand)] underline"
          href="mailto:privacy@gogotrip.kr"
        >
          privacy@gogotrip.kr
        </a>
      </p>

      <h2>10. 개인정보 처리방침의 변경</h2>
      <p>
        본 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따라 변경될 수
        있습니다. 변경 시 사이트 공지를 통해 고지합니다.
      </p>
    </article>
  );
}
