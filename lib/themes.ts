export interface ThemeInfo {
  slug: string;
  name: string;
  description: string;
}

export const THEMES: ThemeInfo[] = [
  {
    slug: "벚꽃축제",
    name: "벚꽃축제",
    description: "봄나들이에 맞는 벚꽃길, 야간 개장, 꽃길 행사",
  },
  {
    slug: "꽃축제",
    name: "꽃축제",
    description: "튤립, 장미, 유채, 수국처럼 계절 꽃을 중심으로 한 행사",
  },
  {
    slug: "음식축제",
    name: "음식축제",
    description: "지역 먹거리, 푸드 페어, 전통시장과 함께 보기 좋은 행사",
  },
  {
    slug: "음악축제",
    name: "음악축제",
    description: "콘서트, 재즈, 록 페스티벌 등 공연 중심 행사",
  },
  {
    slug: "전통축제",
    name: "전통축제",
    description: "민속, 한복, 의례, 전통 공연을 경험할 수 있는 행사",
  },
  {
    slug: "바다축제",
    name: "바다축제",
    description: "해변, 갯벌, 어촌, 항구를 중심으로 열리는 행사",
  },
  {
    slug: "야시장",
    name: "야시장",
    description: "저녁 산책과 먹거리를 함께 즐기기 좋은 야간 행사",
  },
  {
    slug: "불꽃축제",
    name: "불꽃축제",
    description: "불꽃놀이와 야간 관람을 중심으로 한 대형 행사",
  },
  {
    slug: "단풍축제",
    name: "단풍축제",
    description: "가을 산책, 단풍 명소, 지역 문화제가 결합된 행사",
  },
  {
    slug: "눈축제",
    name: "눈축제",
    description: "눈, 얼음, 겨울 체험을 중심으로 한 계절 행사",
  },
  {
    slug: "도자기축제",
    name: "도자기축제",
    description: "도예, 공예, 전시와 체험 프로그램이 있는 행사",
  },
  {
    slug: "과일축제",
    name: "과일축제",
    description: "사과, 배, 포도, 딸기 등 지역 농산물을 만나는 행사",
  },
];

const BY_SLUG = new Map(THEMES.map((theme) => [theme.slug, theme]));

export const findThemeBySlug = (slug: string) => BY_SLUG.get(slug);
