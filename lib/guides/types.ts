/**
 * 편집 가이드 글. DB가 아니라 저장소 파일로 관리해 리뷰·버전 관리가 가능하게 한다.
 * 본문 문자열 안의 `[텍스트](/경로)`는 사이트 내부 링크로 렌더링된다.
 */
export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; title: string; text: string };

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: "준비" | "교통·주차" | "일정 짜기" | "계절" | "정보 확인";
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  summary: string[];
  body: GuideBlock[];
  faq?: GuideFaq[];
  related: string[]; // 다른 가이드 slug
}
