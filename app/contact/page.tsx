import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";

export const metadata: Metadata = {
  title: "문의",
  description: "Roadways 운영, 데이터 문의, 제휴 문의를 받는 페이지입니다.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">문의</h1>
      <h2>대표 연락처</h2>
      <p>
        <a
          className="text-[var(--color-brand)] underline"
          href="mailto:hello@roadways.kr"
        >
          hello@roadways.kr
        </a>
      </p>

      <h2>지원 항목</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>축제 정보 오류 신고</li>
        <li>배너/광고 문의</li>
        <li>데이터 동기화 지연 신고</li>
        <li>기능 개선 제안</li>
      </ul>

      <h2>회신 안내</h2>
      <p>
        접수 후 2~3영업일 내 확인 메일을 드립니다. 운영 공지사항은 홈페이지 상단 공지나
        /plan 페이지에서 공개됩니다.
      </p>
    </article>
  );
}
