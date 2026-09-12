# AdSense 수정 계획 — 여행고고 (roadways.kr)

`DIAGNOSIS_REPORT.md` 기반. CRITICAL+AUTO → CRITICAL+REVIEW → CRITICAL+MANUAL → WARNING+AUTO → WARNING+REVIEW → WARNING+MANUAL 순서.

---

## [RESOLVED] [CRITICAL→WARNING] C3. page_value 게이트가 실제 pSEO 매트릭스에 적용되는지 코드 확인

**카테고리**: YMYL & 정책 (Scaled Content Abuse)
**확인 결과 (2026-09-13, 읽기 전용 코드 확인 완료)**:
- `db/schema.ts`의 `pageValue` 테이블(matrixType/itemCount/isIndexable)은 **미사용(dead code)** — `app/sitemap.ts`, `app/monthly/[year]/[month]/[areaSlug]/page.tsx` 어디서도 import/참조하지 않음
- 다만 동일 목적의 가드가 **다른 경로로 이미 라이브 상태**:
  - `app/sitemap.ts:8,161,191,220` — `MIN_MONTHLY_ITEMS = 3`: 매칭 행사 3건 미만인 지역×월 조합은 사이트맵 자체에서 제외
  - `app/monthly/[year]/[month]/[areaSlug]/page.tsx:23,45,53-55` — `MIN_ITEMS_FOR_INDEX = 3`: 동일 임계치 미달 시 `generateMetadata`가 `robots: { index: false, follow: true }`를 반환(노인덱스, 링크는 유지)
**재평가**: CRITICAL → **WARNING으로 하향**. 즉각적인 Scaled Content Abuse 리스크는 이미 완화돼 있음. `pageValue` 테이블 자체는 미사용 스키마이므로 정리(제거 또는 실제 연결)는 `docs/roadways/implementation-plan.md` Phase B/F backlog로 이관
**리스크**: 없음(읽기 전용 확인만 수행, 코드 변경 없음)
**복구 방법**: 해당 없음

---

## [AUTO] [WARNING] W2. Privacy Policy에 쿠키/DART 문구 보강

**카테고리**: 필수 페이지
**진단 결과**: `app/privacy/page.tsx`에 Google AdSense 제3자 제공은 명시돼 있으나, Google이 권장하는 "쿠키를 사용해 광고를 게재하며 DoubleClick DART 쿠키를 사용할 수 있다" 류의 표준 문구가 없음
**파일/위치**: `app/privacy/page.tsx` (섹션 4 "제3자 제공" 근처)
**실행 계획**:
- Step 1: "4. 제3자 제공" 섹션에 쿠키 및 DART 쿠키 관련 표준 문구 1~2문장 추가
- Step 2: "쿠키 운영" 소제목을 새로 만들어 쿠키 차단 방법(브라우저 설정) 안내 1문장 추가
**예상 결과**: Google이 권장하는 필수 문구 충족
**리스크**: 낮음(법률 자문 대체 아님을 유지, 과장 없이 표준 문구만 추가)
**복구 방법**: git revert

---

## [REVIEW] [WARNING] W1. About 페이지 본문 보강

**카테고리**: 필수 페이지
**진단 결과**: 본문이 약 239자로 짧음. 사이트 목적·운영 방식에 대한 설명을 조금 더 구체화할 여지가 있음
**파일/위치**: `app/about/page.tsx`
**실행 계획**:
- Step 1: 사실에 기반한 추가 문단 초안 작성(예: 데이터 수집 방식, 갱신 주기, 데이터 정책 페이지 연결) — **사용자 확인 후 반영**
- Step 2: 승인 시 About 페이지에 반영
**예상 결과**: 300자 이상, 실질적 정보 포함
**리스크**: 사실 아닌 내용(가짜 연혁, 인원수 등)을 넣지 않도록 반드시 사용자 검토 필요 — 그래서 REVIEW로 분류(AUTO 아님)
**복구 방법**: git revert

---

## [MANUAL] [CRITICAL] C1. 실제 편집 콘텐츠 3~5건 작성

**카테고리**: 콘텐츠 품질
**진단 결과**: `/blog`가 축제 목록일 뿐 편집 글이 아님. 이미 `docs/roadways/implementation-plan.md` P2에 동일 항목 존재(중복 작업 방지를 위해 그쪽 계획을 따를 것)
**실행 계획**: 사용자/운영자가 직접 작성 — 이 스킬은 신규 콘텐츠 자동 생성을 금지
**참고**: 원본 감사 문서 제안 주제 5개(요금/예약 비교, 아이 동반, 대중교통, 우천 취소 확인법, 무료/유료 비교)

## [MANUAL] [CRITICAL] C2. 상위 트래픽 축제 10~20건에 큐레이터 코멘트 수동 작성

**카테고리**: 콘텐츠 품질 / Scaled Content Abuse
**진단 결과**: `curatorNote`가 항상 null. 전체 자동 생성은 Scaled Content Abuse 리스크이므로, 대표 축제 10~20건만 사람이 직접 작성해 `curator_note` 컬럼에 채우는 방식 권장
**실행 계획**:
- Step 1: 트래픽/검색량 상위 축제 10~20건 선정(GSC 데이터 있으면 활용, 없으면 규모가 큰 축제 위주)
- Step 2: 운영자가 직접 1~2문장 코멘트 작성(방문 팁, 비교 포인트 등, TourAPI 원문 재작성 아님)
- Step 3: DB에 반영(스크립트로 일괄 삽입 가능하나 **문구 자체는 사람이 작성**)
**리스크**: 전체 자동화 시 정반대로 Scaled Content Abuse 리스크를 키움 — 소량·수동 유지 필수

## [MANUAL] [WARNING] W11. Organization/사업자 정보

**카테고리**: E-E-A-T
**진단 결과**: 사업자등록번호, 법적 실체(개인/사업자) 정보가 어디에도 없음
**실행 계획**: 사용자가 실제 사업자 여부와 정보를 확인해 About 또는 Privacy에 반영(사업자가 아니면 "개인 프로젝트" 명시도 하나의 선택지)

## [MANUAL] [WARNING] W2-b. 개인정보 보호책임자 실명

**카테고리**: 필수 페이지
**진단 결과**: Privacy 페이지에 이메일만 있고 책임자 성명/직책 없음(한국 개인정보보호법 권장사항)
**실행 계획**: 사용자가 실제 책임자 이름/직책 제공 시 Privacy 페이지에 추가(가짜 이름 기재 금지)

## [MANUAL] [WARNING] W9. 큐레이터 자격/소셜 링크

**카테고리**: E-E-A-T
**진단 결과**: `/about/curator`의 Person 스키마에 실제 소셜 프로필/경력 링크 없음
**실행 계획**: 사용자가 실제 링크 제공 시 반영(가짜 자격 기재 금지)

## [MANUAL] [WARNING] W10. GA4 측정 ID 설정

**카테고리**: E-E-A-T/UX
**진단 결과**: `.env.local`에 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 없음(있어도 되고 없어도 심사엔 필수는 아니지만 운영 관점에서 권장)
**실행 계획**: 사용자가 GA4 속성 발급 후 환경변수 추가(계정 필요, 자동화 불가)

## [MANUAL]/[NEEDS_ACCESS] W4, W7, W8

- W4 이미지 없는 축제 비율: DB 직접 조회 필요(운영 DB 접근 권한 있는 사용자가 확인하거나, 별도 세션에서 읽기 전용 쿼리로 확인 가능)
- W7 PageSpeed 실측: `https://pagespeed.web.dev/`에서 실제 URL 테스트 필요
- W8 GSC 색인 상태: Google Search Console 계정 접근 필요

## [REVIEW] [WARNING] W12. 쿠키 동의 배너

**카테고리**: 광고 설정
**진단 결과**: 배너 없음. 한국 사용자만 대상이면 법적 강제는 아니나, EU 트래픽이 있다면 필요
**실행 계획**: 트래픽 국가 분포 확인 후 필요 시 간단한 배너 컴포넌트 추가 제안(현재는 선택 사항으로 보류 권장)

---

## 요약

- **[AUTO]**: 1개 항목 (W2, Privacy 쿠키 문구) — 즉시 실행 가능, 예상 소요 5분 미만
- **[REVIEW]**: 3개 항목 (C3 코드 확인, W1 About 문단 초안, W12 쿠키 배너 검토)
- **[MANUAL]**: 8개 항목 — 대부분 실제 콘텐츠 작성 또는 계정/사업자 정보 제공 필요

CRITICAL 3건 중 진짜 코드로 해결되는 건 없다(C3은 확인 작업, C1/C2는 콘텐츠 작성). 이게 이 사이트 유형(API 애그리게이터)의 근본적 특성이며, 코드 수정만으로는 애드센스 승인 가능성을 크게 높이기 어렵다.
