import Link from "next/link";

type HubSourceGuideProps = {
  title: string;
  scope: string;
};

/**
 * Shared source-and-freshness explanation for the browse hubs.
 * It deliberately describes only fields synchronized from TourAPI; it does not
 * infer whether an individual event is open, cancelled, or currently operating.
 */
export function HubSourceGuide({ title, scope }: HubSourceGuideProps) {
  return (
    <section className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-6">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">
        {title} 목록을 확인하는 방법
      </h2>
      <div className="mt-4 space-y-4 text-[1rem] leading-8 text-[var(--color-ink-muted)]">
        <p>
          이 목록은 한국관광공사 TourAPI에서 동기화한 축제·공연·행사 데이터 중
          {scope} 조건에 맞고 종료되지 않은 항목을 정리한 탐색용 색인입니다. 카드의
          건수는 사이트가 보유한 동기화 데이터 기준이므로, 특정 지역이나 테마에서
          지금 실제로 열리는 모든 행사를 뜻하지는 않습니다.
        </p>
        <p>
          상세 페이지에서는 TourAPI가 제공한 일정, 장소, 주소, 운영 정보와 함께
          마지막 데이터 갱신 시각을 확인할 수 있습니다. 원문에 공식 홈페이지나
          주최 측 안내 주소가 포함된 경우에는 그 링크를 함께 표시하지만, 주소가
          없는 항목에 임의의 공식 페이지를 연결하지는 않습니다.
        </p>
        <p>
          축제 일정, 입장 방식, 주차, 우천 취소와 조기 마감은 수집 뒤에도 바뀔 수
          있습니다. 방문이나 이동을 결정하기 전에는 상세 페이지의 공식 홈페이지·
          연락처와 주최 측 최신 공지를 다시 확인해 주세요. 이 페이지는 최신 운영
          상태나 개최 여부를 보증하는 공지 채널이 아닙니다.
        </p>
        <p>
          지역 목록은 행사를 찾는 출발점이지 개최를 보증하는 공지 채널은 아닙니다. 카드의 건수나
          정렬 순서는 동기화 데이터의 상태를 보여줄 뿐, 특정 행사의 입장 가능 여부나 현장 운영을
          대신 확인해 주지 않습니다. 관심 행사를 고른 뒤 상세 페이지와 주최 측 안내를 함께 보세요.
        </p>
        <p>
          날짜와 장소가 데이터 기준으로 표시되더라도 입장료, 예약, 주차, 우천 취소, 조기 마감은
          별도 공지로 바뀔 수 있습니다. 공식 링크가 상세 페이지에 없으면 임의의 사이트를 공식
          페이지로 추정하지 말고, 지자체나 주최기관의 최신 연락처와 공지를 직접 확인해야 합니다.
        </p>
        <p>
          정보가 서로 다를 때는 Roadways의 요약보다 원본 공지의 게시일과 적용 범위를 먼저 확인합니다.
          수정 요청을 보낼 때는 행사 URL, 문제가 된 항목, 비교한 공식 링크와 확인 시각을 함께 적어
          주세요. 운영자는 원본과 대조한 뒤 수정하거나, 근거가 부족하면 기존 표시를 유지합니다.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>지역·테마 목록에서 후보를 고르고 상세 페이지로 이동합니다.</li>
          <li>날짜·장소·주소와 마지막 갱신 시각을 먼저 비교합니다.</li>
          <li>입장·주차·예약 조건은 주최기관의 최신 공지로 재확인합니다.</li>
          <li>오류가 있으면 공식 근거를 첨부해 문의하고, 수정 전에는 단정하지 않습니다.</li>
        </ol>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <a
          href="https://www.data.go.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--color-brand)] hover:underline"
        >
          공공데이터포털에서 TourAPI 확인하기
        </a>
        <Link href="/data-policy" className="font-medium text-[var(--color-brand)] hover:underline">
          Roadways 데이터 처리 기준
        </Link>
        <Link href="/contact" className="font-medium text-[var(--color-brand)] hover:underline">
          정보 수정 요청하기
        </Link>
      </div>
    </section>
  );
}
