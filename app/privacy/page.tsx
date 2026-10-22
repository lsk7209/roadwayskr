import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description:
    "여행고고의 개인정보 수집 항목, 이용 목적, 보유 기간, 처리 위탁, 쿠키와 광고, 이용자 권리를 안내합니다.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-10-22";

const PROCESSORS: Array<{ name: string; purpose: string }> = [
  { name: "Vercel Inc.", purpose: "웹사이트 호스팅, 접속 기록(서버 로그) 처리" },
  { name: "Google LLC (Google Analytics)", purpose: "방문 통계 분석" },
  { name: "Google LLC (Google AdSense)", purpose: "광고 게재 및 광고 성과 측정" },
  {
    name: "쿠팡 파트너스 및 배너 제공 서비스",
    purpose: "제휴 배너 표시와 클릭 연결 (배너를 노출하는 기간에 한함)",
  },
];

export default function PrivacyPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">개인정보 처리방침</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        시행일: {LAST_UPDATED}
      </p>
      <p>
        여행고고(이하 &ldquo;사이트&rdquo;)는 개인이 운영하는 축제·행사 정보
        사이트입니다. 회원가입과 로그인 기능이 없으며, 이용자가 직접 입력하는
        폼도 두지 않습니다. 사이트는 「개인정보 보호법」에 따라 이용자의
        개인정보를 보호하고 관련 고충을 처리하기 위해 다음과 같이 처리방침을
        공개합니다.
      </p>

      <h2>1. 수집하는 항목과 방법</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>자동 수집</strong>: 접속 IP 주소, 브라우저·기기 정보, 방문
          일시, 방문한 페이지, 쿠키 및 광고 식별자. 호스팅 서비스와 Google
          Analytics·Google AdSense가 페이지를 불러오는 과정에서 수집합니다.
        </li>
        <li>
          <strong>이용자 제공</strong>: 이메일로 문의하시는 경우 보낸 이메일
          주소, 이름(표시되는 경우), 문의 내용.
        </li>
      </ul>

      <h2>2. 이용 목적</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>사이트 제공, 오류 확인, 보안 위협 대응</li>
        <li>방문 통계 분석을 통한 페이지 개선</li>
        <li>광고 게재 및 광고 성과 측정</li>
        <li>문의 확인과 회신</li>
      </ul>

      <h2>3. 보유 및 이용 기간</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          문의 이메일: 회신을 마친 날로부터 1년간 보관한 뒤 삭제합니다. 법령에
          따라 보존이 필요한 경우에는 그 기간 동안 보관합니다.
        </li>
        <li>
          방문 통계(Google Analytics): Google Analytics 데이터 보관 설정에 따라
          최대 14개월 보관 후 자동 삭제됩니다.
        </li>
        <li>
          서버 접속 기록: 호스팅 서비스의 로그 보관 정책에 따라 단기간 보관된 뒤
          자동 삭제됩니다.
        </li>
        <li>
          광고 쿠키: 이용자가 브라우저에서 삭제하거나 만료될 때까지 이용자의
          기기에 저장됩니다.
        </li>
      </ul>

      <h2>4. 파기 절차와 방법</h2>
      <p>
        보유 기간이 끝난 문의 이메일은 메일함에서 영구 삭제합니다. 외부 서비스가
        보관하는 정보는 각 서비스의 보관 기간이 지나면 자동으로 삭제됩니다.
      </p>

      <h2>5. 제3자 제공</h2>
      <p>
        사이트는 이용자의 개인정보를 제3자에게 판매하거나 제공하지 않습니다. 다만
        법령에 근거한 요청이 있는 경우는 예외로 합니다.
      </p>

      <h2>6. 처리 위탁 및 국외 이전</h2>
      <p>
        사이트 운영을 위해 아래 업체의 서비스를 이용하며, 이 과정에서 1항의 자동
        수집 정보가 해당 업체의 서버(미국 등 국외)로 전송될 수 있습니다.
      </p>
      <div className="overflow-x-auto">
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left">
              <th className="py-2 pr-4">업체</th>
              <th className="py-2">위탁 업무</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSORS.map((p) => (
              <tr key={p.name} className="border-b border-[var(--color-line)]">
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2">{p.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>7. 쿠키와 맞춤 광고</h2>
      <p>
        이 사이트는 Google AdSense를 이용해 광고를 게재합니다. Google을 비롯한
        제3자 공급업체는 쿠키(예: DoubleClick DART 쿠키)를 사용해 이용자가 이
        사이트와 다른 사이트를 방문한 기록을 바탕으로 광고를 게재합니다. Google의
        광고 쿠키 사용 방식은{" "}
        <a
          className="underline"
          href="https://policies.google.com/technologies/ads?hl=ko"
          target="_blank"
          rel="noreferrer"
        >
          Google 광고 정책
        </a>
        에서 확인할 수 있습니다.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          맞춤 광고 끄기:{" "}
          <a
            className="underline"
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            Google 광고 설정
          </a>
        </li>
        <li>
          쿠키 거부: 브라우저 설정에서 쿠키 저장을 차단하거나 삭제할 수 있습니다
          (Chrome: 설정 → 개인정보 보호 및 보안 → 서드 파티 쿠키). 쿠키를 거부해도
          사이트의 행사 정보는 그대로 이용할 수 있습니다.
        </li>
        <li>
          방문 통계 수집 거부:{" "}
          <a
            className="underline"
            href="https://tools.google.com/dlpage/gaoptout?hl=ko"
            target="_blank"
            rel="noreferrer"
          >
            Google Analytics 차단 브라우저 부가기능
          </a>
        </li>
      </ul>

      <h2>8. 이용자의 권리</h2>
      <p>
        이용자는 언제든지 자신의 개인정보(문의 이메일 등) 열람, 정정, 삭제, 처리
        정지를 요구할 수 있습니다. 아래 이메일로 요청하시면 지체 없이 처리하고 그
        결과를 알려 드립니다.
      </p>

      <h2>9. 개인정보 보호책임자</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>책임자: 여행고고 운영자(개인 운영)</li>
        <li>
          연락처:{" "}
          <a className="underline" href="mailto:privacy@roadways.kr">
            privacy@roadways.kr
          </a>
        </li>
      </ul>
      <p>
        개인정보 침해에 대한 신고나 상담이 필요하면 개인정보침해신고센터(국번
        없이 118, privacy.kisa.or.kr) 또는 개인정보분쟁조정위원회(1833-6972,
        www.kopico.go.kr)에 문의하실 수 있습니다.
      </p>

      <h2>10. 방침의 변경</h2>
      <p>
        이 방침의 내용이 바뀌면 시행일과 함께 이 페이지에 공지합니다.
      </p>
    </article>
  );
}
