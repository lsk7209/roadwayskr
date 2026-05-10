import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://gogotrip.kr";

export const metadata: Metadata = {
  title: "큐레이터 고고지기",
  description:
    "여행고고의 전속 큐레이터 고고지기 소개. 전국 축제·행사를 가족 단위 시점으로 답사·정리합니다.",
  alternates: { canonical: "/about/curator" },
};

export default function CuratorPage() {
  // Person Schema (EEAT 작성자 신호)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "고고지기",
    alternateName: "여행고고 큐레이터",
    description:
      "전국 축제·행사 큐레이터. 가족 단위 주말 나들이 정보 정리.",
    url: `${SITE_URL}/about/curator`,
    knowsAbout: ["축제", "행사", "주말 나들이", "가족 여행", "지역 관광"],
    worksFor: { "@type": "Organization", name: "여행고고", url: SITE_URL },
  };

  return (
    <article className="prose-ko max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">고고지기</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        여행고고 전속 큐레이터 · 전국 축제·행사 답사 담당
      </p>

      <h2>역할</h2>
      <p>
        고고지기는 한국관광공사 TourAPI, 공연예술통합전산망(KOPIS), 각 지자체
        공식 발표를 1차 출처로 전국 축제·행사를 큐레이션하는 여행고고의 전속
        큐레이터입니다. 가족 단위 방문객의 시점에서 거리·운영시간·입장료·주차
        가능 여부·어린이 동반 가능 여부를 4대 기본 정보로 모든 페이지에
        명시합니다.
      </p>

      <h2>전문 영역</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>전국 17개 시도·250여 개 시군구 축제·행사 큐레이션</li>
        <li>가족 단위 주말 나들이 동선 설계</li>
        <li>공공데이터 기반 행사 정보 검증·정규화</li>
      </ul>

      <h2>편집 원칙</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>검증된 사실만. 추측은 &lsquo;보입니다 / 예상됩니다&rsquo;로 명시.</li>
        <li>본인 답사가 없는 정보는 &lsquo;공식 발표 기준&rsquo;으로 출처 분명히.</li>
        <li>변경·취소 정보는 24시간 내 반영, 마지막 업데이트 시각 모든 페이지에 노출.</li>
        <li>출처 없는 &lsquo;최고의~ / 최대의~&rsquo; 단언을 쓰지 않음.</li>
      </ul>

      <h2>데이터 출처</h2>
      <p>
        모든 행사 정보의 1차 출처는 다음과 같습니다.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>한국관광공사 TourAPI 4.0 (KorService2)</li>
        <li>공연예술통합전산망 KOPIS</li>
        <li>각 지자체 공식 발표 자료</li>
      </ul>

      <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
        문의는{" "}
        <a className="underline" href="/contact">
          문의 페이지
        </a>
        를 이용해 주세요.
      </p>
    </article>
  );
}
