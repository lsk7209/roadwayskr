/**
 * 지역/테마 허브 페이지의 "총 N건" 표시를 만든다.
 * DB LIMIT으로 잘린 배열 길이(items.length)를 total로 잘못 쓰는 것을 막기 위해
 * 실제 count(*) 쿼리 결과(totalCount)와 화면에 표시된 건수(displayedCount)를
 * 분리해서 받는다.
 */
export function formatCollectionCountLabel(
  totalCount: number,
  displayedCount: number,
): string {
  if (totalCount > displayedCount) {
    return `총 ${totalCount}건 중 최신 ${displayedCount}건을 표시합니다`;
  }
  return `${totalCount}건`;
}
