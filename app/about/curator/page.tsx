import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "운영자 소개",
  description:
    "여행고고를 운영하는 큐레이터 고고지기와 행사 정보를 고르고 정리하는 기준을 소개합니다.",
  alternates: { canonical: `${SITE_URL}/about/curator` },
};

export default function CuratorPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "고고지기",
    alternateName: "여행고고 큐레이터",
    description:
      "여행고고 운영자. 공공데이터 기반 축제·행사 정보를 지역·일정·테마 기준으로 정리합니다.",
    url: `${SITE_URL}/about/curator`,
    knowsAbout: ["축제", "행사", "주말 나들이", "지역 관광", "공공데이터"],
    worksFor: { "@type": "Organization", name: "여행고고", url: SITE_URL },
  };

  return (
    <article className="prose-body prose-ko max-w-3xl">
      <JsonLd id="curator-jsonld" data={personSchema} />

      <h1 className="text-3xl font-bold tracking-tight">운영자 소개</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        여행고고는 &lsquo;고고지기&rsquo;라는 이름으로 활동하는 개인이 기획하고
        운영합니다. 데이터 수집 코드 작성, 페이지 구성, 오류 수정, 문의 응대를
        한 사람이 맡고 있습니다.
      </p>

      <h2>이 사이트에서 하는 일</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          한국관광공사 TourAPI 행사 데이터를 매일 받아, 종료·취소 행사를 걸러내고
          지역·테마·주말 기준으로 다시 묶습니다.
        </li>
        <li>
          날짜가 뒤바뀌었거나 장소가 비어 있는 원자료는 주최 측 공지와 대조해
          보정하고, 보정한 항목과 대조일을 상세 페이지에 남깁니다.
        </li>
        <li>
          제보받은 오류는 확인 후 수정하고, 같은 유형의 오류가 다시 생기지 않게
          수집 규칙을 고칩니다.
        </li>
      </ul>

      <h2>정보를 고르고 쓰는 기준</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          원자료에 없는 입장료·주차·편의시설 정보는 추정해서 채우지 않고
          &ldquo;확인 필요&rdquo;로 둡니다.
        </li>
        <li>
          &ldquo;최대 규모&rdquo;, &ldquo;꼭 가야 할&rdquo; 같은 출처 없는 단언은
          쓰지 않습니다.
        </li>
        <li>
          직접 방문하지 않은 행사를 다녀온 것처럼 쓰지 않습니다. 현장 확인이
          아닌 정보는 &lsquo;공식 발표 기준&rsquo;임을 밝힙니다.
        </li>
        <li>
          광고나 제휴 여부가 행사 노출 순서에 영향을 주지 않게 합니다.
        </li>
      </ul>

      <h2>연락</h2>
      <p>
        잘못된 일정이나 장소를 발견하셨거나 다뤄 줬으면 하는 행사가 있다면{" "}
        <Link className="underline" href="/contact">
          문의 페이지
        </Link>
        의 이메일로 알려 주세요. 행사 이름과 페이지 주소를 함께 보내 주시면 더
        빨리 확인할 수 있습니다.
      </p>
    </article>
  );
}
