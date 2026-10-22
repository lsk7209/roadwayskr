import { cleanTourText, extractTourIntroProgram } from "./content";

/**
 * 축제 상세 페이지의 색인 품질 게이트.
 * 소개·프로그램 본문이 짧은 행사는 페이지는 유지하되 noindex + sitemap 제외한다.
 * 얇은 페이지 비율이 사이트 전체 품질 평가(AdSense "가치 없는 콘텐츠")를 끌어내리지 않게 한다.
 */
export const MIN_SUBSTANTIVE_CHARS = 300;

const countChars = (value: string | null) =>
  value ? value.replace(/\s+/g, "").length : 0;

export function substantiveLength(festival: {
  overview: string | null;
  rawJson: string | null;
}): number {
  return (
    countChars(cleanTourText(festival.overview)) +
    countChars(extractTourIntroProgram(festival.rawJson))
  );
}

export function hasSubstantiveContent(festival: {
  overview: string | null;
  rawJson: string | null;
}): boolean {
  return substantiveLength(festival) >= MIN_SUBSTANTIVE_CHARS;
}
