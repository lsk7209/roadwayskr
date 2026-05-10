import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "데이터 정책",
  description:
    "여행고고가 사용하는 행사·축제 데이터의 출처·갱신 주기·정확성 정책을 투명하게 공개합니다.",
  alternates: { canonical: "/data-policy" },
};

export default function DataPolicyPage() {
  return (
    <article className="prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">데이터 정책</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        여행고고가 사용하는 데이터의 출처·갱신 주기·정확성 정책을 공개합니다.
      </p>

      <h2>1. 1차 데이터 출처</h2>
      <p>본 사이트는 다음 공공데이터·공식 발표를 1차 출처로 사용합니다.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>한국관광공사 TourAPI 4.0</strong> (KorService2) — 전국 축제·공연·행사,
          관광지 좌표·이미지·기본 정보
        </li>
        <li>
          <strong>공연예술통합전산망 (KOPIS)</strong> — 공연·뮤지컬·전시 (2차 단계 통합 예정)
        </li>
        <li>
          <strong>각 지자체 공식 발표</strong> — 시군구별 공지, 보도자료
        </li>
      </ul>

      <h2>2. 데이터 갱신 주기</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>매일 04:00 KST</strong> — TourAPI 변경분 자동 동기화
        </li>
        <li>
          <strong>주 1회 일요일 03:00 KST</strong> — 행정구역 코드 동기화
        </li>
        <li>
          <strong>실시간</strong> — 큐레이터가 변경·취소를 인지한 경우 24시간 내
          반영
        </li>
      </ul>

      <h2>3. 정확성 정책</h2>
      <p>
        본 사이트는 다음 원칙에 따라 정보의 정확성을 유지하기 위해 노력합니다.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          모든 행사 페이지 하단에 <strong>마지막 업데이트 시각</strong>을 노출합니다.
        </li>
        <li>
          본인 답사 또는 1차 확인이 없는 정보는 &lsquo;공식 발표 기준&rsquo;으로
          출처를 표기합니다.
        </li>
        <li>
          출처가 불명확한 &lsquo;최고의~&rsquo;, &lsquo;최대의~&rsquo; 같은
          단언적 표현을 사용하지 않습니다.
        </li>
        <li>
          행사 정보의 시차로 인한 불일치가 있을 수 있으므로, 방문 전에 공식
          홈페이지·주최 측에 다시 한번 확인을 권장합니다.
        </li>
      </ul>

      <h2>4. 데이터 활용 및 라이선스</h2>
      <p>
        TourAPI 등 공공데이터는{" "}
        <strong>공공누리 제1유형(출처 표시) 또는 제4유형(상업적 이용 가능)</strong>{" "}
        조건에 따라 사용됩니다. 본 사이트는 출처 표기 의무를 모든 페이지에서
        준수합니다.
      </p>

      <h2>5. 큐레이션 결과의 저작권</h2>
      <p>
        원천 데이터의 저작권은 각 데이터 제공 기관에 귀속됩니다. 본 사이트의
        큐레이션 결과(편집·재구성·해설·큐레이터 코멘트)에 대한 저작권은
        여행고고에 있습니다. 무단 복제·재배포를 금합니다.
      </p>

      <h2>6. 정보 수정 요청</h2>
      <p>
        오류 발견 시{" "}
        <a className="underline" href="/contact">
          문의 페이지
        </a>
        를 통해 신고해 주세요. 영업일 기준 3일 이내 검토하고, 검증된 경우 24시간
        내 반영합니다.
      </p>

      <h2>7. AI 사용 안내</h2>
      <p>
        본 사이트의 본문 정보는 공공데이터를 기반으로 하며, 큐레이터 한 줄
        코멘트 등 일부 보조 텍스트 생성에 LLM(거대 언어 모델)을 활용할 수
        있습니다. AI가 생성한 텍스트는 큐레이터가 검수한 후 게시되며, 사실
        오인이 발견되는 즉시 수정합니다. 본문(행사 개요·일정·장소 등 핵심 정보)은
        AI로 자동 생성하지 않습니다.
      </p>
    </article>
  );
}
