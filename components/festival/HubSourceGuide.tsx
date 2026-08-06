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
