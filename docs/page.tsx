import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "여행고고 소개",
  description:
    "여행고고는 전국 17개 시도 축제·행사를 가족 단위 시점으로 큐레이션하는 여행 미디어입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">여행고고 소개</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        전국 축제·행사를 가족 단위 시점으로 정리하는 한국형 여행 미디어
      </p>

      <h2>우리가 하는 일</h2>
      <p>
        여행고고는 전국 17개 시도, 250여 개 시군구의 축제·행사 정보를 한 곳에
        모아 보여 드립니다. 한국관광공사 TourAPI를 비롯한 공공데이터를 매일 새벽
        자동으로 동기화하고, 큐레이터 고고지기가 가족 단위 방문객의 시점에서
        정보를 정리합니다.
      </p>

      <h2>4대 기본 정보 원칙</h2>
      <p>
        모든 행사 페이지에는 <strong>거리</strong>·<strong>운영시간</strong>·
        <strong>입장료</strong>·<strong>어린이 동반 가능 여부</strong>를 4대
        기본 정보 카드로 항상 노출합니다. 자녀와 함께 떠나는 주말 나들이를
        준비할 때 가장 먼저 확인해야 할 항목들이라고 보기 때문입니다.
      </p>

      <h2>편집 방침</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>검증된 사실만 짧은 문장으로 전달합니다.</li>
        <li>
          출처가 분명하지 않으면 &lsquo;공식 발표 기준&rsquo;으로 표기합니다.
        </li>
        <li>
          행사가 변경·취소될 경우 24시간 내 반영하고, 모든 페이지 하단에
          마지막 업데이트 시각을 노출합니다.
        </li>
        <li>
          호들갑이나 광고형 카피
          (&lsquo;꼭 가보세요!!&rsquo;, &lsquo;강추!!&rsquo;)를 쓰지 않습니다.
        </li>
      </ul>

      <h2>운영자</h2>
      <p>
        큐레이터:{" "}
        <a className="underline" href="/about/curator">
          고고지기
        </a>
        <br />
        문의:{" "}
        <a className="underline" href="/contact">
          문의 페이지
        </a>
        <br />
        데이터 정책:{" "}
        <a className="underline" href="/data-policy">
          데이터 정책 페이지
        </a>
      </p>
    </article>
  );
}
