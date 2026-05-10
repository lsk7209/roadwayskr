import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description:
    "여행고고 사이트·콘텐츠 관련 문의를 보내실 수 있습니다. 정보 수정 요청, 제휴, 광고 문의를 받습니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">문의</h1>

      <h2>이메일</h2>
      <p>
        <a
          className="text-[var(--color-brand)] underline"
          href="mailto:hello@roadways.kr"
        >
          hello@roadways.kr
        </a>
      </p>

      <h2>받을 수 있는 문의</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>행사 정보 수정·추가·삭제 요청 (주최 측 또는 일반 이용자)</li>
        <li>오타·오류 신고</li>
        <li>제휴 및 광고 협업</li>
        <li>큐레이션 제안 (특정 지역·테마 보강 요청)</li>
        <li>개인정보 관련 요청 (열람·정정·삭제·처리정지)</li>
      </ul>

      <h2>응답 안내</h2>
      <p>
        평일 기준 영업일 3일 이내 답변드립니다. 행사 정보 수정 요청은 공식 발표
        자료 또는 주최 측 확인 후 24시간 내 반영하는 것을 원칙으로 합니다.
      </p>

      <h2>운영자 정보</h2>
      <p>
        본 사이트는 1인 운영 미디어로 운영됩니다. 사업자 정보·통신판매업
        신고번호 등은 사업자 등록 후 추가 표기됩니다.
      </p>
    </article>
  );
}
