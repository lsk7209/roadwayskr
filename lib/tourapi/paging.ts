/** 같은 페이지가 반복되면(첫 항목이 이미 수집됨) 불완전 수집으로 보고 중단한다. */
export function isRepeatedPage(
  collected: { contentid: string }[],
  page: { contentid: string }[],
): boolean {
  return page.length > 0 && collected.some((a) => a.contentid === page[0].contentid);
}

/** 이 실행보다 id가 큰 실행이 있으면 이 실행은 옛 실행이다. */
export function isSuperseded(runId: number, newerRunIds: number[]): boolean {
  return newerRunIds.some((id) => id > runId);
}
