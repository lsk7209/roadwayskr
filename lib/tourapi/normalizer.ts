import type {
  FestivalRaw,
  FestivalIntroRaw,
  FestivalCommonRaw,
} from "./types";
import type { NewFestival } from "@/db/schema";

/**
 * TourAPI 원본 → DB 스키마 정규화
 *
 * - 빈 문자열 → null
 * - 'YYYYMMDD' → 'YYYY-MM-DD'
 * - 좌표 string → number
 * - 무료/유료 휴리스틱 (text 필드에서 키워드 검출)
 * - 가족 동반 휴리스틱 (placeinfo + program + agelimit 분석)
 * - 슬러그 생성 (한글 그대로 + contentId prefix로 충돌 방지)
 * - 테마 추출 (cat1/2/3 + 제목 키워드 매칭)
 */

const FREE_KEYWORDS = ["무료", "free", "입장료 없음", "입장 무료"];
const FAMILY_BLOCK_KEYWORDS = ["19세 이상", "성인 전용", "청소년 관람불가"];
const LDONG_TO_AREA_CODE: Record<string, string> = {
  "11": "1",
  "26": "6",
  "27": "4",
  "28": "2",
  "29": "5",
  "30": "3",
  "31": "7",
  "36": "8",
  "41": "31",
  "51": "32",
  "43": "33",
  "44": "34",
  "47": "35",
  "48": "36",
  "52": "37",
  "46": "38",
  "50": "39",
};

const THEME_KEYWORD_MAP: Record<string, string[]> = {
  벚꽃축제: ["벚꽃", "벚나무", "사쿠라"],
  단풍축제: ["단풍"],
  도자기축제: ["도자기", "도자", "공예", "도예"],
  불꽃축제: ["불꽃", "불꽃놀이", "폭죽"],
  야시장: ["야시장", "야간장"],
  음식축제: ["음식", "맛", "푸드", "먹거리"],
  음악축제: ["음악", "콘서트", "재즈", "록 페스티벌"],
  꽃축제: ["꽃", "튤립", "장미", "유채", "수국"],
  눈축제: ["눈", "얼음", "빙어", "송어"],
  바다축제: ["바다", "해변", "갯벌", "어촌", "어시장"],
  전통축제: ["전통", "민속", "한복", "탈춤"],
  과일축제: ["과일", "사과", "배", "포도", "감", "토마토", "딸기", "수박"],
};

export function normalizeFestival(args: {
  base: FestivalRaw;
  common?: FestivalCommonRaw;
  intro?: FestivalIntroRaw;
}): NewFestival {
  const { base, common, intro } = args;

  const title = base.title.trim();
  const overview = clean(common?.overview);
  const description = overview ? truncate(overview, 200) : null;

  const startDate = toIsoDate(base.eventstartdate ?? intro?.eventstartdate);
  const endDate = toIsoDate(base.eventenddate ?? intro?.eventenddate);
  const status = computeStatus(startDate, endDate);

  const eventPlace = clean(intro?.eventplace);
  const program = clean(intro?.program);
  const ageLimit = clean(intro?.agelimit);
  const fee = clean(intro?.usetimefestival);

  const themes = extractThemes({ title, overview, eventPlace, program });

  const familyFriendly = computeFamilyFriendly({ ageLimit, title, overview });
  const feeIsFree = computeFeeFree(fee);

  const lat = toNumber(base.mapy ?? common?.mapy);
  const lng = toNumber(base.mapx ?? common?.mapx);

  return {
    contentId: Number(base.contentid),
    source: "tourapi",
    title,
    slug: makeSlug(title, base.contentid),
    description,
    overview,

    startDate,
    endDate,

    areaCode: getAreaCode(base, common),
    sigunguCode: clean(base.sigungucode ?? common?.sigungucode),
    ldongRegnCd: clean(base.lDongRegnCd ?? common?.lDongRegnCd),
    ldongSignguCd: clean(base.lDongSignguCd ?? common?.lDongSignguCd),

    address: clean(base.addr1 ?? common?.addr1),
    addressDetail: clean(base.addr2 ?? common?.addr2),
    lat,
    lng,

    imageUrl: clean(base.firstimage ?? common?.firstimage),
    imageThumbnail: clean(base.firstimage2 ?? common?.firstimage2),
    sourceUrl: clean(common?.homepage),

    themesJson: themes.length ? JSON.stringify(themes) : null,
    themesCsv: themes.length ? `,${themes.join(",")},` : null,

    familyFriendly,
    petFriendly: null, // TourAPI에 직접 필드 없음 → 추후 큐레이터 보강

    fee,
    feeIsFree,

    organizer: clean(intro?.sponsor1),
    sponsor: clean(intro?.sponsor2),
    eventPlace,
    playTime: clean(intro?.playtime),
    useTime: clean(intro?.usetimefestival),
    homepage: clean(common?.homepage),
    tel: clean(base.tel ?? common?.tel),

    status,
    rawJson: JSON.stringify({ base, common, intro }),
    curatorNote: null, // 후속 단계: LLM이 페르소나 톤으로 생성

    isIndexable: true,
    syncedAt: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function clean(v: string | undefined | null): string | null {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function toIsoDate(v: string | undefined): string | null {
  const c = clean(v);
  if (!c) return null;
  // 'YYYYMMDD' 형식만 처리. 잘못된 형식은 null.
  if (!/^\d{8}$/.test(c)) return null;
  return `${c.slice(0, 4)}-${c.slice(4, 6)}-${c.slice(6, 8)}`;
}

function toNumber(v: string | undefined): number | null {
  const c = clean(v);
  if (!c) return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function computeStatus(
  start: string | null,
  end: string | null,
): "upcoming" | "ongoing" | "ended" {
  if (!start || !end) return "upcoming";
  const today = new Date().toISOString().slice(0, 10);
  if (today < start) return "upcoming";
  if (today > end) return "ended";
  return "ongoing";
}

function computeFamilyFriendly(args: {
  ageLimit: string | null;
  title: string;
  overview: string | null;
}): boolean | null {
  const blob = `${args.ageLimit ?? ""} ${args.title} ${args.overview ?? ""}`;
  if (FAMILY_BLOCK_KEYWORDS.some((k) => blob.includes(k))) return false;
  if (args.ageLimit && args.ageLimit.includes("전체")) return true;
  if (args.ageLimit && args.ageLimit.includes("가족")) return true;
  return null; // 모르면 null로 두고 큐레이터 보강
}

function computeFeeFree(fee: string | null): boolean | null {
  if (!fee) return null;
  return FREE_KEYWORDS.some((k) =>
    fee.toLowerCase().includes(k.toLowerCase()),
  );
}

function getAreaCode(
  base: FestivalRaw,
  common: FestivalCommonRaw | undefined,
): string | null {
  const areaCode = clean(base.areacode ?? common?.areacode);
  if (areaCode) return areaCode;

  const ldongRegnCd = clean(base.lDongRegnCd ?? common?.lDongRegnCd);
  return ldongRegnCd ? (LDONG_TO_AREA_CODE[ldongRegnCd] ?? null) : null;
}

function extractThemes(args: {
  title: string;
  overview: string | null;
  eventPlace: string | null;
  program: string | null;
}): string[] {
  const blob = [args.title, args.overview, args.eventPlace, args.program]
    .filter(Boolean)
    .join(" ");
  const found = new Set<string>();
  for (const [theme, keywords] of Object.entries(THEME_KEYWORD_MAP)) {
    if (keywords.some((k) => blob.includes(k))) found.add(theme);
  }
  return [...found];
}

function makeSlug(title: string, contentId: string): string {
  // 한글은 그대로, 공백·특수문자만 정리. contentId 없이는 충돌 위험.
  const cleaned = title
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
    .replace(/[\\/?%*:|"<>]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${contentId}-${cleaned}`;
}
