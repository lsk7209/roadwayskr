/**
 * IndexNow + 검색엔진 ping (문서용 참고)
 * - 실행 경로에서 직접 임포트해 쓰거나, 운영에서 scripts/sync-tourapi.ts 의
 *   자동 실행 흐름에서 호출해서 색인을 요청합니다.
 */

export { notifySearchEngines } from "../lib/search-indexing";
export { fireIndexNow, pingNaverIndexnow, pingSitemapEndpoint } from "../lib/search-indexing";

export async function pingNaverSitemap(): Promise<void> {
  await pingSitemapEndpoint("https://searchadvisor.naver.com/indexnow");
}
