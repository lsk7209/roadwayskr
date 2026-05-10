import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

export const metadata: Metadata = {
  title: "큐레이터 소개",
  description: "Roadways 콘텐츠 운영자와 데이터 운영 철학을 소개합니다.",
  alternates: { canonical: `${SITE_URL}/about/curator` },
};

export default function CuratorPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Roadways 큐레이터",
    alternateName: "Roadways Editorial",
    description: "축제·여행 콘텐츠 큐레이터. 지역/테마 기반 정보를 정렬·보정합니다.",
    url: `${SITE_URL}/about/curator`,
    knowsAbout: ["축제", "여행", "지역 이벤트", "주말 일정", "여행 일정 플래닝"],
    worksFor: { "@type": "Organization", name: "Roadways", url: SITE_URL },
  };

  return (
    <article className="prose-body prose-ko max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">큐레이터 소개</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Roadways 큐레이터는 공개 소스 기반 축제 데이터와 운영 규칙을 결합해 방문 동선에
        바로 쓸 수 있는 콘텐츠를 만듭니다.
      </p>

      <h2>운영 원칙</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>중요 정보는 지역·기간·테마로 교차 확인</li>
        <li>빈 페이지/오류 페이지를 줄이는 라우트 점검 우선</li>
        <li>광고 정책 준수와 사용자 가독성 우선 설계</li>
      </ul>

      <h2>작성 방식</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>주요 이벤트는 간결한 제목과 실제 날짜·장소 중심으로 정리</li>
        <li>중복 노출을 줄이기 위해 라벨과 카테고리 중복 최소화</li>
        <li>문장 길이를 짧게 유지해 모바일 가독성 강화</li>
      </ul>

      <h2>문의</h2>
      <p>
        운영 제안은{" "}
        <a className="underline" href="/contact">
          /contact
        </a>{" "}
        에 남겨주세요.
      </p>
    </article>
  );
}
