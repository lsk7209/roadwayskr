import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "여행고고는 주말 축제 정보를 빠르게 찾을 수 있는 큐레이션 가이드입니다.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">서비스 소개</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Roadways는 전국 축제·행사 정보를 주제별로 정리하고, 방문 동선을 빠르게
        잡을 수 있도록 만든 서비스입니다.
      </p>

      <h2>무엇을 제공하나요</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>주말 집중 축제 목록과 지역별 정렬</li>
        <li>테마 기반 추천 리스트</li>
        <li>월별 지역 조합 페이지로 탐색 경로 단축</li>
        <li>운영 상태 점검을 위한 /plan 페이지</li>
      </ul>

      <h2>콘텐츠 신뢰 기준</h2>
      <p>
        일정·장소·운영 상태 정보를 우선 반영하고, 수집 경로는 공개 소스와 내부
        정합성 점검을 거쳐 제공합니다. 깨짐·오류 페이지를 줄이기 위해 라우트별
        상태를 정기 점검하고 있습니다.
      </p>

      <h2>빠른 안내</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          큐레이터 소개:{" "}
          <a className="underline" href="/about/curator">
            /about/curator
          </a>
        </li>
        <li>
          문의:{" "}
          <a className="underline" href="/contact">
            /contact
          </a>
        </li>
        <li>
          정책:{" "}
          <a className="underline" href="/data-policy">
            /data-policy
          </a>
        </li>
      </ul>
    </article>
  );
}
