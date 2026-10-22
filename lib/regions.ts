/**
 * TourAPI 4.0 areaCode 기준 17개 시도.
 * - code: TourAPI areaCode (string)
 * - slug: URL용 한글 슬러그 (`/지역/[slug]`)
 * - name: 정식 명칭 (페이지 H1·메타·schema)
 * - shortName: 좁은 공간용 (네비·뱃지)
 */

export interface AreaInfo {
  code: string;
  slug: string;
  name: string;
  shortName: string;
}

export const AREAS: AreaInfo[] = [
  { code: "1", slug: "서울", name: "서울특별시", shortName: "서울" },
  { code: "2", slug: "인천", name: "인천광역시", shortName: "인천" },
  { code: "3", slug: "대전", name: "대전광역시", shortName: "대전" },
  { code: "4", slug: "대구", name: "대구광역시", shortName: "대구" },
  { code: "5", slug: "광주", name: "광주광역시", shortName: "광주" },
  { code: "6", slug: "부산", name: "부산광역시", shortName: "부산" },
  { code: "7", slug: "울산", name: "울산광역시", shortName: "울산" },
  { code: "8", slug: "세종", name: "세종특별자치시", shortName: "세종" },
  { code: "31", slug: "경기도", name: "경기도", shortName: "경기" },
  { code: "32", slug: "강원도", name: "강원특별자치도", shortName: "강원" },
  { code: "33", slug: "충청북도", name: "충청북도", shortName: "충북" },
  { code: "34", slug: "충청남도", name: "충청남도", shortName: "충남" },
  { code: "35", slug: "경상북도", name: "경상북도", shortName: "경북" },
  { code: "36", slug: "경상남도", name: "경상남도", shortName: "경남" },
  { code: "37", slug: "전라북도", name: "전북특별자치도", shortName: "전북" },
  { code: "38", slug: "전라남도", name: "전라남도", shortName: "전남" },
  { code: "39", slug: "제주", name: "제주특별자치도", shortName: "제주" },
];

const BY_SLUG = new Map(AREAS.map((a) => [a.slug, a]));
const BY_CODE = new Map(AREAS.map((a) => [a.code, a]));
for (const area of AREAS) {
  BY_SLUG.set(area.name, area);
  BY_SLUG.set(area.shortName, area);
}

export const findAreaBySlug = (slug: string) => BY_SLUG.get(slug);
export const findAreaByCode = (code: string) => BY_CODE.get(code);

/**
 * 공급자 코드가 없을 때 주소 첫 토큰으로 시도를 찾는다. 확인된 별칭만 사용하며
 * 모르는 주소는 null(지역 확인 필요)로 남긴다. 원문 주소는 바꾸지 않는다.
 */
const SIDO_ALIASES: Record<string, string> = {
  전북: "37",
  전북특별자치도: "37",
  전라북도: "37",
  강원: "32",
  강원특별자치도: "32",
  강원도: "32",
  제주: "39",
  제주특별자치도: "39",
  제주도: "39",
  세종: "8",
  세종시: "8",
};

/**
 * 전남광주통합특별시 주소는 시·군이면 전남(38), 자치구(동·서·남·북·광산구)이면
 * 광주(5)로만 대응한다. 둘 다 아니면 null.
 */
const GWANGJU_GU = new Set(["동구", "서구", "남구", "북구", "광산구"]);

export function resolveAreaCodeFromAddress(
  address: string | null | undefined,
): string | null {
  const parts = address?.trim().split(/\s+/);
  if (!parts?.[0]) return null;
  const first = parts[0];
  const direct = BY_SLUG.get(first) ?? SIDO_ALIASES[first];
  if (direct) return typeof direct === "string" ? direct : direct.code;
  if (first === "전남광주통합특별시") {
    const second = parts[1] ?? "";
    if (GWANGJU_GU.has(second)) return "5";
    if (/[시군]$/.test(second)) return "38";
  }
  return null;
}
