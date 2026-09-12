# AdSense 진단 리포트 — 여행고고 (roadways.kr)

> 진단 일시: 2026-09-13
> 스택: Next.js 15.1.0 (App Router) / Vercel
> DB: Drizzle + Turso (libSQL)
> 언어: ko-KR
> 콘텐츠 유형: TourAPI 기반 축제·행사 큐레이션(디렉토리형), 편집 "글"은 사실상 없음

이 리포트는 `docs/roadways/`(2026-09-12 진행한 대규모 코드 감사)와 별개로, **AdSense 심사 통과 가능성**만을 기준으로 한 42항목 체크리스트 결과다. 두 문서는 서로 보완적이며 중복 항목은 상호 참조로 표시한다.

## 📊 진단 요약

| 카테고리 | CRITICAL ❌ | WARNING ⚠️ | PASS ✅ |
|---|---|---|---|
| 필수 페이지 | 0 | 2 | 2 |
| 콘텐츠 품질 | 2 | 2 | 4 |
| 사이트 구조 | 0 | 1 | 5 |
| 기술 SEO | 0 | 2 | 4 (2 NEEDS_ACCESS) |
| E-E-A-T | 0 | 4 | 2 |
| YMYL & 정책 | 1 | 0 | 4 |
| 광고 설정 | 0 | 1 | 4 |
| **합계** | **3** | **12** | **25** |

## 🎯 종합 판정

**재신청 전 CRITICAL 3건 해결 권장. 현재 상태로 신청 시 통과 가능성 낮음~중간.**

가장 큰 리스크는 개별 항목의 결함이 아니라 **사이트 성격 자체**다: roadways.kr은 한국관광공사 TourAPI를 그대로 정리해 보여주는 디렉토리형 사이트이고, 축제 상세 페이지의 `curatorNote`(큐레이터 코멘트) 필드가 **정규화 단계에서 항상 `null`로 고정**되어 있어(`lib/tourapi/normalizer.ts:128`) 모든 상세 페이지가 원본 API 텍스트 그대로 노출된다. Google 리뷰어 입장에서는 "제3자 데이터를 재배열만 한 사이트"로 보일 위험이 있다 — 이게 Category 2/6의 CRITICAL 2건의 근본 원인이다.

**예상 승인 가능성**: 낮음~중간 (CRITICAL 3건 중 콘텐츠 관련 2건은 코드로 자동 해결 불가 — 실제 편집 콘텐츠 작성이 필요)

---

## 🚨 CRITICAL (3건)

### C1. [카테고리 2.1/2.3] 편집 콘텐츠 사실상 0건
- `/blog`는 축제 목록 페이지이지 편집 글이 아니다(이미 `docs/roadways/implementation-plan.md`의 P2 backlog "Phase I"에 동일 이슈 기록됨 — OBS-06)
- 축제 상세 페이지(수백~수천 건)는 전부 TourAPI 원문 발췌(`overview`, `program`)로만 구성되고 원본 대비 부가가치(비교, 방문 팁, 독자적 분석)가 없음
- **AUTO 불가** — 신규 콘텐츠 작성은 이 스킬 규칙상 자동화 금지

### C2. [카테고리 2.3/6.5] `curatorNote` 필드가 코드 레벨에서 항상 비어있음
- `lib/tourapi/normalizer.ts:128` — `curatorNote: null, // 후속 단계: LLM이 페르소나 톤으로 생성`
- `components/festival/CuratorNote.tsx:8` — `if (!festival.curatorNote) return null;` → 어떤 페이지에도 큐레이터 코멘트가 뜬 적이 없음
- 수백~수천 개의 동일 구조·동일 톤 페이지가 하나의 공개 API에서 그대로 생성되는 패턴은 Google의 **Scaled Content Abuse** 정책이 명시적으로 경계하는 패턴과 일치(`references/adsense-policy-checklist.md` 6.5)
- **AUTO 불가** — 수천 건에 코멘트를 자동 생성하는 것 자체가 Scaled Content Abuse 리스크. 상위 트래픽 축제 10~20건만 사람이 직접 코멘트를 쓰는 방식을 권장(원래 감사 문서의 "대표 상세 보강 10건" 목표와 동일)

### C3. [카테고리 6.5] Scaled Content Abuse 시그널 (pSEO 매트릭스) — ✅ RESOLVED (2026-09-13)
- `app/sitemap.ts`가 지역×월(`monthly`), 테마, 지역 조합으로 프로그램적 생성 페이지를 다수 만든다(`MIN_MONTHLY_ITEMS = 3`, `MAX_MONTHLY_MONTHS = 18` → 최대 17지역×18개월 = 306개 월별 조합 페이지 후보)
- 코드 확인 결과: DB의 `page_value` 테이블은 미사용(dead code)이지만, `MIN_MONTHLY_ITEMS=3`(sitemap.ts)과 `MIN_ITEMS_FOR_INDEX=3`+`robots:{index:false}`(monthly 페이지)가 이미 실질적으로 저가치 조합을 걸러내고 있음을 확인
- **CRITICAL → WARNING 하향**. 상세: `PATCH_PLAN.md` C3 참고

---

## ⚠️ WARNING (12건, 요약)

| # | 카테고리 | 항목 | 근거 |
|---|---|---|---|
| W1 | 1.1 About | 본문 약 239자로 권장(300자) 미달 | `app/about/page.tsx` |
| W2 | 1.3 Privacy | "쿠키"/DoubleClick DART 문구 없음, 개인정보 보호책임자 실명 없음(이메일만) | `app/privacy/page.tsx` |
| W3 | 2.5 콘텐츠 깊이 | 상세 페이지에 FAQ/비교 없음, 구조는 있으나 프로즈 깊이 부족 | InfoCards 구조 확인 |
| W4 | 2.6 이미지 사용 | 이미지 없는 축제 비율 미확인(DB 미조회) | NEEDS_ACCESS |
| W5 | 3.5 검색 기능 | 사이트 내 검색 없음(권장, 필수 아님) | — |
| W6 | 4.2 구조화 데이터 | Article/BlogPosting 스키마 없음(실제 글이 없으니 당연하지만, 리뷰어 체크포인트) | — |
| W7 | 4.6 페이지 속도 | PageSpeed 실측 안함(이번 세션 범위 밖) | NEEDS_ACCESS |
| W8 | 4.8 GSC 색인 | Search Console 접근 권한 없어 실제 색인 상태 미확인 | NEEDS_ACCESS |
| W9 | 5.1/5.3 저자 정보 | 축제 상세 페이지엔 저자 표시 없음(데이터 목록 특성상 당연), `/about/curator`는 있으나 검증 가능한 자격/소셜 링크 없음 | `app/about/curator/page.tsx` |
| W10 | 5.5 UX 시그널 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` 미설정으로 GA 비활성 상태로 추정 | `.env.local` |
| W11 | 5.6 Organization | 사업자등록번호/법적 실체 정보 전혀 없음(개인 프로젝트인지 사업자인지 불명) | 전체 페이지 |
| W12 | 7.5 쿠키 동의 | 쿠키 동의 배너 없음(한국 법상 필수는 아니나 권장) | `app/layout.tsx` |

## ✅ PASS (25건, 요약)

- 필수 페이지 4종 전부 존재, Contact/Terms 내용 충실
- ads.txt 정상(`google.com, pub-3050601904412736, DIRECT, f08c47fec0942fa0`)
- robots.txt, sitemap.xml, canonical, viewport, HTTPS, 404 페이지 정상 (2026-09-12 세션에서 이미 개선됨)
- 주제 일관성(축제·행사 단일 니치), 스팸/금지 콘텐츠 없음
- AdSense Auto ads + 쿠팡 제휴 배너 모두 신뢰 페이지 제외 규칙 적용됨(2026-09-12 세션)
- 광고 위장 없음, 광고 네트워크 충돌 없음
- Organization/WebSite/Person/BreadcrumbList/Event(Festival) 구조화 데이터 구현됨
- YMYL 아님(축제 정보는 건강/금융/법률 범주 밖)
- 과장 문구("실시간", "전국 모든 축제" 등) 이미 정리됨(2026-09-12 세션)

---

## 🧠 5-Persona 교차 검증

- **PM 관점**: 실사용자에게 지역·일정 비교 가치는 있으나, "왜 이 사이트를 봐야 하는지"에 대한 편집적 이유가 약함
- **SEO 관점**: 기술 SEO는 이미 상당히 정리됨(직전 세션 성과) — 크롤링 장애물은 거의 없음
- **콘텐츠 관점**: 저자/편집자가 실재한다는 느낌이 거의 없음 — `curatorNote`가 항상 비어있는 게 결정적
- **QA 관점**: 기본 결함(404, 깨진 링크, 빈 카테고리 안내)은 이미 잘 처리됨
- **정책 관점**: YMYL 리스크는 없으나, Scaled Content Abuse 리스크는 실재함 — 이게 가장 큰 정책 리스크

## 다음 단계

`PATCH_PLAN.md` 참고.
