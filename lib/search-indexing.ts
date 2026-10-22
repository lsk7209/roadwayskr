/**
 * 검색엔진 변경 알림 (IndexNow 호환 프로토콜)
 *
 * - Google과 Bing은 익명 `ping?sitemap=` 엔드포인트를 폐기했다.
 *   (Google: 2023-06 발표, Bing: 2022-05 발표. 현재는 sitemap 선언 +
 *   Search Console 등록으로 자연 색인을 유도한다.)
 * - IndexNow 프로토콜은 Bing·네이버·Yandex·Seznam 등 참여 엔진에
 *   한 번의 요청으로 변경 알림을 전달한다. 한 엔진에 보낸 알림은
 *   다른 참여 엔진과 공유될 수 있으므로 무의미한 중복 전송을 피한다.
 * - Google Indexing API는 JobPosting/BroadcastEvent 타입만 공식
 *   지원하므로 이 사이트(행사/축제)에는 적용하지 않는다.
 *
 * 전송 성공(accepted)은 색인 완료를 의미하지 않는다. 색인 여부는
 * 각 검색엔진의 콘솔(Search Console, 서치어드바이저)에서 별도 확인한다.
 *
 * 사용 예: 행사 발행/수정 직후 notifySearchEngines([url1, url2])
 */

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://searchadvisor.naver.com/indexnow",
];

/** IndexNow protocol's own documented per-request URL limit. */
const INDEXNOW_MAX_URLS = 10_000;
const FETCH_TIMEOUT_MS = 8_000;

export type NotifyStatus =
  | "disabled"
  | "accepted_pending_validation"
  | "failed";

export interface NotifyResult {
  endpoint: string;
  status: NotifyStatus;
  httpStatus?: number;
}

async function fetchWithTimeout(
  url: string,
  body: string,
): Promise<{ ok: boolean; status: number }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
      signal: ctrl.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 변경된 URL을 IndexNow 호환 엔진에 알린다.
 * `INDEXNOW_KEY`가 설정되지 않으면 disabled 상태를 반환하고
 * 어떤 외부 요청도 만들지 않는다.
 */
export async function notifySearchEngines(
  urls: string[],
): Promise<NotifyResult[]> {
  const key = process.env.INDEXNOW_KEY?.trim();
  const unique = [...new Set(urls.filter(Boolean))];

  if (!key || unique.length === 0) {
    return INDEXNOW_ENDPOINTS.map((endpoint) => ({
      endpoint,
      status: "disabled" as const,
    }));
  }

  const target = unique.slice(0, INDEXNOW_MAX_URLS);
  const host = new URL(SITE_URL).host;
  const payload = JSON.stringify({
    host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: target,
  });

  const results = await Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const { ok, status } = await fetchWithTimeout(endpoint, payload);
      if (!ok) {
        console.warn(`[indexing] indexnow failed: ${endpoint} (${status})`);
      }
      return {
        endpoint,
        status: (ok ? "accepted_pending_validation" : "failed") as NotifyStatus,
        httpStatus: status,
      };
    }),
  );

  return results;
}
