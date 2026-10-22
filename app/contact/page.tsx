import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "문의",
  description:
    "여행고고 행사 정보 오류 제보, 데이터 문의, 제휴 문의 방법과 회신 기준을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">문의</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        여행고고는 개인이 운영하는 사이트입니다. 모든 문의는 이메일로 받고,
        운영자가 직접 읽고 답합니다.
      </p>

      <h2>대표 연락처</h2>
      <p>
        <a
          className="text-[var(--color-brand)] underline"
          href="mailto:hello@roadways.kr"
        >
          hello@roadways.kr
        </a>
        <br />
        개인정보 관련 요청:{" "}
        <a className="underline" href="mailto:privacy@roadways.kr">
          privacy@roadways.kr
        </a>
      </p>

      <h2>이런 내용을 받습니다</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>행사 일정·장소·요금이 공식 안내와 다른 경우</li>
        <li>취소·연기된 행사가 아직 목록에 보이는 경우</li>
        <li>다뤄 줬으면 하는 행사나 지역 제안</li>
        <li>광고·제휴 문의</li>
      </ul>

      <h2>오류를 제보하실 때</h2>
      <p>아래 세 가지를 함께 적어 주시면 확인이 빨라집니다.</p>
      <ol className="list-decimal pl-5 space-y-1">
        <li>행사 이름과 여행고고 페이지 주소</li>
        <li>잘못된 항목(예: 종료일, 장소)</li>
        <li>근거가 되는 공식 공지 링크</li>
      </ol>
      <p>
        확인이 끝난 오류는 해당 페이지에 바로 반영합니다. TourAPI 원자료 자체가
        잘못된 경우에는 원자료가 고쳐질 때까지 상세 페이지에 보정 내용을 따로
        표시합니다.
      </p>

      <h2>회신 안내</h2>
      <p>
        보통 영업일 기준 3일 안에 답장을 드립니다. 행사가 임박한 오류 제보는 먼저
        확인합니다. 문의 메일에는 연락에 필요한 정보 외의 개인정보를 적지 말아
        주세요. 받은 메일의 처리 방식은{" "}
        <Link className="underline" href="/privacy">
          개인정보처리방침
        </Link>
        에 따릅니다.
      </p>
    </article>
  );
}
