import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "데이터 정책",
  description: "서비스에서 사용하는 축제 데이터와 표시 정책을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/data-policy` },
};

export default function DataPolicyPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">데이터 정책</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        수집·가공·표시되는 축제 데이터의 출처, 처리 기준, 표시 방식에 대한 정책을 안내합니다.
      </p>

      <h2>데이터 출처</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          한국관광공사 <a className="underline" href="https://api.visitkorea.or.kr/" target="_blank" rel="noreferrer">TourAPI</a>를 중심으로 공개된 축제·행사 원본 정보
        </li>
        <li>운영 DB 정합성 기준(활성/종료 여부, 기간, 지역코드, 주제 라벨)</li>
        <li>수동 보정 항목은 내부 운영 규칙 기반 반영</li>
      </ul>

      <p>
        Roadways는 원본 기관을 대신해 행사 개최 여부를 보증하는 서비스가 아닙니다. 수집된 제목,
        기간, 지역, 장소, 주소와 같은 필드를 방문자가 비교하기 쉬운 형태로 정리하며, 원본에 없는
        정보는 임의로 채우지 않습니다. 각 행사 상세 페이지에 원본 링크가 있는 경우에는 해당
        링크를 함께 확인하고, 링크가 없는 경우에는 주최기관이나 지자체의 최신 공지를 직접
        확인해야 합니다.
      </p>

      <h2>표시 기준</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>진행 중/예정 이벤트만 우선 노출</li>
        <li>종료 이벤트는 검색 우선순위를 낮추거나 보조 노출</li>
        <li>중복 또는 동일 이벤트는 고유 주소로 병합 처리</li>
      </ul>

      <h2>방문 전 확인 순서</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>행사 상세 페이지에서 날짜, 장소, 주소가 서로 맞는지 확인합니다.</li>
        <li>입장료·예약·주차·운영시간이 필요한 행사라면 주최기관의 공지를 우선합니다.</li>
        <li>비·폭염·감염병·시설 사정에 따른 변경과 취소 공지를 출발 직전에 다시 확인합니다.</li>
        <li>Roadways의 목록과 원본 공지가 다르면 원본 공지를 기준으로 판단하고 문의로 알려주세요.</li>
      </ol>

      <h2>갱신 시점과 한계</h2>
      <p>
        데이터는 수집 작업이 실행된 시점의 공개 원본을 바탕으로 갱신됩니다. 원본 기관의 수정이
        다음 수집보다 먼저 반영되거나, 행사 운영자가 별도 채널에서만 변경을 알리는 경우에는
        Roadways와 실제 현장 정보 사이에 시간 차이가 생길 수 있습니다. 따라서 목록의 “진행 중”
        표시는 최신 공지와 동일한 의미가 아니며, 특히 날짜가 임박한 행사는 공식 채널의 공지와
        연락처를 함께 확인해야 합니다.
      </p>

      <h2>오류 신고와 수정 요청</h2>
      <p>
        제목·기간·장소·주소·상태가 잘못 표시되었거나 공식 링크가 오래된 것을 발견했다면 행사
        URL과 확인한 원본 링크, 수정이 필요한 내용을 적어 <a className="underline" href="/contact">문의 페이지</a>로 보내주세요.
        운영자는 제보 내용을 원본과 대조한 뒤 다음 데이터 작업에 반영합니다. 신고 접수만으로
        즉시 수정되거나 행사 개최가 확정되는 것은 아닙니다.
      </p>

      <h2>정확도 보장</h2>
      <p>
        원본 데이터의 변경 주기가 불규칙한 경우가 있어 최신성은 수집 시점 기반으로 반영됩니다.
        오차가 있으면 페이지 하단 문의 채널을 통해 신고해 주세요.
      </p>

      <h2>문의</h2>
      <p>
        데이터 오류 수정 요청은 <a className="underline" href="/contact">문의</a> 페이지로 접수해 주세요.
      </p>
    </article>
  );
}
