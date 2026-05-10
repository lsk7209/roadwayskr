/**
 * IndexNow + 검색엔진 ping
 *
 * - IndexNow: Bing·Yandex·Seznam 등 호환 엔진 한 번에
 * - 네이버 서치어드바이저 / 다음 검색은 별도 ping 사용
 * - Google Indexing API는 JobPosting/BroadcastEvent만 공식 지원이라 본 사이트엔 부적합
 *   (대신 sitemap + 정확한 lastmod로 자연 색인 유도)
 *
 * 사용 예: 행사 발행/수정 직후 fireIndexNow([url1, url2])
 */

const SITE_URL = process.env.SITE_URL ?? "https://gogotrip.kr";

export async function fireIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  const host = new URL(SITE_URL).host;
  const payload = {
    host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls.slice(0, 10_000),
  };

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[indexnow] ping failed:", err);
  }
}

/**
 * 네이버 서치어드바이저는 OAuth 기반 API라 별도 키 필요.
 * 단순 sitemap ping으로는 더 이상 받지 않으므로,
 * 네이버용은 서치어드바이저 콘솔에서 sitemap 등록 후 자동 색인에 의존.
 */
export async function pingNaverSitemap(): Promise<void> {
  // 네이버는 ping 엔드포인트 미제공. 서치어드바이저에서 sitemap 등록만 하면 됨.
  // 이 함수는 인터페이스 일관성을 위해 남겨둠.
}
