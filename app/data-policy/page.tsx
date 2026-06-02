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
        <li>공개된 축제/행사 원본 정보 제공처</li>
        <li>운영 DB 정합성 기준(활성/종료 여부, 기간, 지역코드, 주제 라벨)</li>
        <li>수동 보정 항목은 내부 운영 규칙 기반 반영</li>
      </ul>

      <h2>표시 기준</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>진행 중/예정 이벤트만 우선 노출</li>
        <li>종료 이벤트는 검색 우선순위를 낮추거나 보조 노출</li>
        <li>중복 또는 동일 이벤트는 고유 주소로 병합 처리</li>
      </ul>

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
