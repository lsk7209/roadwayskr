/**
 * 신뢰·문의·정책·관리 화면은 광고/제휴 배치에서 제외한다.
 * AutoAds(구글 애드센스)와 제휴 배너처럼 서로 다른 컴포넌트가 각자
 * 제외 목록을 따로 들고 있으면 하나만 고쳐서 어긋나기 쉬우므로 공통 모듈로 둔다.
 */
export const AD_EXCLUDED_PATH_PREFIXES = [
  "/admin",
  "/privacy",
  "/terms",
  "/contact",
  "/data-policy",
] as const;

export function isAdExcludedPath(pathname: string): boolean {
  return AD_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
