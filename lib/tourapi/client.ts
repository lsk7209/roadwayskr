import {
  FestivalCommonRaw,
  FestivalIntroRaw,
  FestivalRaw,
  TourApiEnvelope,
} from "./types";

/**
 * TourAPI 4.0 (KorService2) 클라이언트
 *
 * - serviceKey는 .env의 Decoding 키 그대로 사용 (URLSearchParams가 인코딩 처리)
 * - rate limit: 개발계정 1만건/일. 응답 헤더 또는 resultCode로 감지
 * - 자동 재시도: 5xx와 네트워크 오류 시 지수 백오프 (3회)
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "gogotrip",
  _type: "json",
} as const;

export type Operation =
  | "searchFestival2"
  | "areaCode2"
  | "ldongCode2"
  | "detailCommon2"
  | "detailIntro2"
  | "detailInfo2"
  | "areaBasedSyncList2";

interface CallOptions {
  retries?: number;
  timeoutMs?: number;
}

export class TourApiError extends Error {
  constructor(
    message: string,
    public readonly resultCode?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

export async function callTourApi<T = unknown>(
  operation: Operation,
  params: Record<string, string | number | undefined>,
  opts: CallOptions = {},
): Promise<{ items: T[]; totalCount: number; raw: unknown }> {
  const { retries = 3, timeoutMs = 15_000 } = opts;
  const serviceKey = process.env.TOUR_API_SERVICE_KEY;
  if (!serviceKey) throw new TourApiError("TOUR_API_SERVICE_KEY is not set");

  const search = new URLSearchParams();
  search.append("serviceKey", serviceKey);
  for (const [k, v] of Object.entries(COMMON_PARAMS)) search.append(k, v);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.append(k, String(v));
  }

  const url = `${BASE_URL}/${operation}?${search.toString()}`;

  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(t);

      if (!res.ok) {
        if (res.status >= 500 && attempt < retries - 1) {
          await sleep(backoff(attempt));
          continue;
        }
        throw new TourApiError(
          `HTTP ${res.status} ${res.statusText}`,
          undefined,
          res.status,
        );
      }

      const json = await res.json();
      const parsed = TourApiEnvelope.safeParse(json);
      if (!parsed.success) {
        throw new TourApiError(
          `Invalid response shape: ${parsed.error.message}`,
        );
      }

      const code = parsed.data.response.header.resultCode;
      if (code !== "0000") {
        // 일부 코드는 재시도 가능 (한도 초과, 일시 오류)
        if (
          ["22", "23"].includes(code) && // 22: limited number of service requests, 23: temporary
          attempt < retries - 1
        ) {
          await sleep(backoff(attempt));
          continue;
        }
        throw new TourApiError(
          `TourAPI error: ${parsed.data.response.header.resultMsg}`,
          code,
        );
      }

      const body = parsed.data.response.body;
      const totalCount = Number(body?.totalCount ?? 0);

      // body.items는 string("") 또는 { item: [...] } 또는 { item: {...} }
      let items: T[] = [];
      const rawItems = body?.items;
      if (rawItems && typeof rawItems === "object" && "item" in rawItems) {
        const item = (rawItems as { item: unknown }).item;
        items = Array.isArray(item) ? (item as T[]) : [item as T];
      }

      return { items, totalCount, raw: json };
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await sleep(backoff(attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function backoff(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────
// 고수준 헬퍼
// ─────────────────────────────────────────────────────────────

/**
 * 변경분 동기화 (areaBasedSyncList2)
 * @param modifiedTime YYYYMMDD - 이 날짜 이후 수정된 항목만
 */
export async function fetchSyncList(modifiedTime: string, pageNo = 1) {
  return callTourApi<FestivalRaw>("areaBasedSyncList2", {
    contentTypeId: 15, // 축제·공연·행사
    arrange: "D", // 수정일순
    modifiedtime: modifiedTime,
    numOfRows: 100,
    pageNo,
  });
}

/**
 * 지역+기간 축제 목록 (searchFestival2)
 */
export async function fetchFestivals(opts: {
  eventStartDate: string; // YYYYMMDD
  eventEndDate?: string;
  areaCode?: string;
  sigunguCode?: string;
  pageNo?: number;
  numOfRows?: number;
}) {
  return callTourApi<FestivalRaw>("searchFestival2", {
    eventStartDate: opts.eventStartDate,
    eventEndDate: opts.eventEndDate,
    areaCode: opts.areaCode,
    sigunguCode: opts.sigunguCode,
    arrange: "B", // 수정일+제목순
    numOfRows: opts.numOfRows ?? 100,
    pageNo: opts.pageNo ?? 1,
  });
}

/**
 * 행사 상세 정보 (3개 엔드포인트 병렬 호출)
 */
export async function fetchFestivalDetail(contentId: string | number) {
  const [common, intro] = await Promise.all([
    callTourApi<FestivalCommonRaw>("detailCommon2", { contentId }),
    callTourApi<FestivalIntroRaw>("detailIntro2", { contentId, contentTypeId: 15 }),
  ]);
  return {
    common: common.items[0],
    intro: intro.items[0],
  };
}
