import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "이용약관",
  description: "Roadways 사이트 이용, 콘텐츠 이용 범위, 광고·게시물 규칙을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

const LAST_UPDATED = "2026-05-10";

export default function TermsPage() {
  return (
    <article className="prose-body prose-ko max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">이용약관</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">최종 갱신: {LAST_UPDATED}</p>

      <h2>1. 서비스 이용</h2>
      <p>
        본 서비스는 공개된 축제·행사 정보를 기반으로 조회 편의 기능을 제공합니다. 이용자는
        해당 정보를 가공하거나 재배포할 때 출처를 표기해야 합니다.
      </p>

      <h2>2. 제공 정보의 정확성</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>이벤트 일정·장소는 변경될 수 있어 실제 운영 정보는 주최 측 공지를 함께 확인해야 합니다.</li>
        <li>오차 발생 시 즉시 신고해 주세요.</li>
        <li>미확인 정보는 별도 표시로 안내할 수 있습니다.</li>
      </ul>

      <h2>3. 금지 행위</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>허위 정보 유포, 자동화 스팸, 무단 스크래핑</li>
        <li>서비스 보안에 영향을 주는 악성 요청</li>
        <li>광고 정책을 우회한 과도한 유인성 행위</li>
      </ul>

      <h2>4. 광고 안내</h2>
      <p>
        본 사이트의 광고는 Google AdSense의 노출 정책에 맞춰 운영되며, 콘텐츠와 분리된 영역에만
        노출됩니다. 특정 항목과 광고 노출이 과도하게 밀집하지 않도록 개선합니다.
      </p>

      <h2>5. 면책</h2>
      <p>
        운영자는 행사 자체 취소/변경에 대해 직접 책임을 지지 않으며, 이용자가 해당 정보를 활용해
        발생한 직접·간접 손실에 대한 책임은 이용자에게 있습니다.
      </p>

      <h2>6. 이용 제한 및 해지</h2>
      <p>
        약관 위반 시 이용권한이 제한될 수 있으며, 반복 위반 시 접근이 중단될 수 있습니다.
      </p>

      <h2>7. 분쟁 해결</h2>
      <p>
        본 약관은 대한민국 법령을 준거법으로 하며, 문의는 홈페이지 내 문의 채널로 접수해 주세요.
      </p>
    </article>
  );
}
