# AdSense 진단 리포트 (재진단) — 여행고고 (roadways.kr)

> 진단 일시: 2026-10-22 · 기준 커밋: `6cc6912` (origin/main)
> 스택: Next.js 15 App Router / Vercel / Drizzle + Turso
> AdSense 사이트 상태: `GETTING_READY` (`D:\env\adsense_sites.txt` 기준, 조회 시점 미상)
> 이전 진단: `docs/adsense/DIAGNOSIS_REPORT.md` (2026-09-13)

## 📊 요약

| 카테고리 | CRITICAL ❌ | WARNING ⚠️ | PASS ✅ |
|---|---|---|---|
| 필수 페이지 | 1 | 3 | 0 |
| 콘텐츠 품질 | 3 | 2 | 3 |
| 사이트 구조 | 0 | 2 | 4 |
| 기술 SEO | 0 | 2 | 6 |
| E-E-A-T | 1 | 3 | 2 |
| YMYL & 정책 | 1 | 0 | 4 |
| 광고 설정 | 0 | 1 | 4 |
| **합계** | **6** | **13** | **23** |

**종합 판정: 지금 상태로는 승인 가능성 낮음.** 기술 SEO는 탄탄하다. 하지만 리뷰어가 보는 거의 모든 페이지가 한국관광공사 TourAPI 원문을 다시 배치한 것이다. 사이트 고유의 편집 콘텐츠는 0건이다.

## 실측 데이터 (라이브, 2026-10-22)

| 항목 | 값 |
|---|---|
| sitemap URL 수 | 237개 (festivals 180, monthly 24, regions 13, themes 11, 정적 9) |
| 축제 상세 본문(공백 제외) | 830~1,257자. 그중 TourAPI `overview` 233~418자 |
| 큐레이터 코멘트 노출 | 0건 (`normalizer.ts:134`가 항상 `null`) |
| 편집 글(블로그 포스트) | 0건. `/blog`는 축제 목록이고 `/blog/{slug}`는 404 |
| /about 본문 | 239자 |
| /about/curator 본문 | 210자 |
| /contact 본문 | 113자 |
| /privacy 본문 | 610자 |

> ⚠️ 메모리에 기록된 "블로그 72편/599개 포스트"(2026-05~06)는 이 GitHub 저장소 코드에 존재하지 않는다. DB(`posts` 테이블)에 남아 있는지는 DB 접근 권한이 없어 확인하지 못했다.

---

## ❌ CRITICAL (6)

### C1. [2.1/2.3] 고유 편집 콘텐츠 0건
- 색인 페이지 237개 전부가 TourAPI 데이터의 목록·재배치다. 같은 원문이 visitkorea.or.kr과 다수의 애그리게이터에 존재한다.
- `/blog`("최근 소식")는 축제 카드 목록이다. 리뷰어는 "블로그" 메뉴에서 글을 기대한다.

### C2. [2.3/6.5] 축제 상세 = 제3자 원문 + 템플릿
- 상세 페이지의 고유 텍스트는 고정 문구(출처·주의 안내)뿐이다.
- `CuratorNote` 컴포넌트는 있지만 데이터는 항상 비어 있다. `persona.json`의 must_include 항목("인근 함께 둘러볼 행사 3건", "이런 분에게 추천", FAQ)도 미구현이다.
- 같은 구조의 페이지 180개 → "Low value content / Scaled content" 판정 패턴과 일치한다.

### C3. [2.1] 상세 페이지 분량 미달 + 얇은 페이지도 색인
- overview가 200자대인 행사도 `index` 상태다. 얇은 페이지 비율이 사이트 품질 평균을 끌어내린다.

### C4. [1.3] 개인정보처리방침에 미완성 문구 노출
- `app/privacy/page.tsx` 3항: "구체적인 보관기간과 삭제 절차는 **운영자 확인이 필요합니다**" → 리뷰어 눈에 작성 중인 페이지로 보인다.
- 개인정보 보호책임자, 처리 위탁(Vercel·Google·Turso), 시행일 항목이 없다.

### C5. [5.1/5.6] 운영 주체 불명확·브랜드 혼재
- 헤더·푸터·JSON-LD는 "여행고고/고고지기"이고, about·curator·contact·privacy 본문과 메타는 "Roadways"다. 동일 사이트로 인식하기 어렵다.
- 큐레이터 Person 스키마 이름은 "Roadways 큐레이터"이고 실체가 없다. 운영 형태(개인/사업자)도 표기되지 않았다.

### C6. [6.5] 콘텐츠 가치 대비 광고·제휴 비중
- 상세·목록 페이지에 Auto Ads와 쿠팡 배너("차량용 여행용품")가 같이 노출된다. 고유 콘텐츠가 0인 상태에서 제휴 배너는 "광고를 위해 만든 사이트" 시그널을 강화한다. 승인 전에는 쿠팡 배너를 끄는 것을 권장한다.

## ⚠️ WARNING (13)

| # | 항목 | 근거 |
|---|---|---|
| W1 | About 239자, 사이트 목적·데이터 처리 방식·갱신 주기 설명 부족 | `app/about/page.tsx` |
| W2 | Contact 113자, 회신 소요 기간·운영자 표기 없음 | `app/contact/page.tsx` |
| W3 | Terms·Data policy는 있으나 브랜드명 불일치 | 동일 |
| W4 | 상세 페이지 내부 링크가 홈·지역별 2개뿐(인근/동일 테마 행사 링크 없음) → 고립 페이지화 | `festivals/.../page.tsx` |
| W5 | 상세 breadcrumb이 실제 지역이 아니라 "지역별"로 고정 | 동일 437행 |
| W6 | `/blog` 명칭·내용 불일치 ("최근 소식"인데 축제 목록) | `app/blog/page.tsx` |
| W7 | 홈·상세·지역·블로그가 `force-dynamic` → TTFB와 DB 비용 증가 (roadwayskr2에 ISR 수정본 있음) | |
| W8 | `/api/indexnow` 무인증 (roadwayskr2에 수정본 있음) | |
| W9 | Organization `logo: /logo.png`가 404 (roadwayskr2에 `icon.svg` 수정본 있음) | `app/layout.tsx` |
| W10 | 메타 description이 TourAPI 원문 전체를 길이 제한 없이 사용 (160자 초과 가능) | `generateMetadata` |
| W11 | Event OG 이미지 크기를 1200×630으로 허위 선언 | 동일 |
| W12 | 큐레이터 자격·소셜 링크 없음(가짜 기재 금지 → 사용자 정보 필요) | |
| W13 | 쿠키 동의 배너 없음(국내 전용이면 선택) | |

## ✅ PASS (23, 요약)
필수 4종 페이지가 존재하고 푸터에서 1클릭으로 접근할 수 있음 · ads.txt 정상(`pub-3050601904412736`) · robots/sitemap/canonical/viewport/HTTPS/404 정상 · lastmod 실데이터 기반 · 월별 조합 3건 미만 noindex · 종료·취소 행사 noindex · Event/Breadcrumb/Organization/WebSite JSON-LD · Naver 인증 + RSS · 주제 일관성 · YMYL 아님 · 금지 콘텐츠 없음 · 광고 위장 없음 · 정책 페이지 광고 제외 · AdSense 코드 사전 배치.

## 🧠 5-Persona 교차 검증
- **PM**: "TourAPI·visitkorea 대신 여기를 봐야 할 이유"가 화면에 없다.
- **SEO**: 크롤링 장애는 없다. 다만 상세 페이지 간 내부 링크가 약하다.
- **콘텐츠**: 사람이 운영한다는 흔적(글·코멘트·운영자 정보)이 거의 없다. → 가장 큰 결함
- **QA**: Privacy의 "운영자 확인이 필요합니다", 브랜드 혼재, logo 404
- **정책**: 원문 재배치형 pSEO 180페이지 + 제휴 배너 → Low value 리스크
