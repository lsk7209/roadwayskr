# roadways.kr 개선 실행 계획

`audit-baseline.md`의 CONFIRMED 항목을 근거로 한 우선순위. 외부 지시서의 18-Phase를 이 저장소 실제 상태에 맞춰 재구성했다. 완료 표시는 실제 코드 변경·검증 완료 시에만 한다.

## P0-1 (완료) — 즉시 수정한 공용 화면 문구/노출
- OBS-01/01b/01c: `app/page.tsx`, `app/blog/page.tsx`의 심사봇·크롤러 대상 문구 제거, 한국어 방문자 안내문으로 교체
- OBS-03: `/plan` 공개 라우트 제거(내용은 `manual-actions.md`로 이관), 홈/About/Contact/sitemap 링크 정리
- OBS-02: `app/robots.ts`에서 `/_next/` 차단 제거

## P1-1 (완료, 2026-09-12 같은 세션) — 분류·집계·도메인 코드 수정
- Phase E: `lib/tourapi/normalizer.ts` 테마 키워드에서 1글자 오분류 키워드("배"·"감"·"맛"·"눈") 제거/대체 → OBS-05 근본 원인 수정
- Phase E: `app/themes/[themeSlug]/page.tsx`, `app/regions/[areaSlug]/page.tsx`에서 `items.length` 대신 실제 `count(*)` 결과 표시(`lib/collection-count-label.ts`) → OBS-04 수정
- Phase G: `next.config.ts`에 host 기반 `redirects()` 추가해 `www.roadways.kr` → `https://roadways.kr` 308 리디렉션 적용(기존엔 중복 호스트로 그대로 200 서빙되고 있었음)
- Phase E: OBS-08(지역 별칭)은 코드 조사 결과 NOT_REPRODUCED로 재분류(`audit-baseline.md` 참고)
- 테스트: `tests/theme-classification.test.ts`, `tests/collection-count-label.test.ts` 추가, 전체 17/17 통과

### 후속 필요 (승인 필요 — 이번 배치에서 실행하지 않음)
- **재동기화 백필**: 위 테마 분류 수정은 코드에만 반영됐고, 프로덕션 DB에 이미 저장된 기존 오분류 `themesCsv`는 그대로 남아 있다. `pnpm sync:tourapi:full`(또는 부분 재분류 스크립트)을 돌려야 실제 화면에 반영된다 — 운영 DB 쓰기이므로 사용자 승인 후 실행
- **www 리디렉션 배포 확인**: `next.config.ts` 변경은 배포돼야 프로덕션에 적용된다. 배포 후 `curl -I https://www.roadways.kr/`로 308 확인 필요

## P1-2 (완료, 2026-09-12 같은 세션 3차) — sitemap lastmod, JSON-LD 검토
- Phase G 9.3: `app/sitemap.ts`의 `/about`, `/about/curator`, `/contact`, `/data-policy`, `/privacy`, `/terms` 6개 정적 페이지가 festivals 데이터 갱신 시각(`lastUpdated`)을 lastmod로 그대로 물려받던 것을 제거(허위 신선도 신호). 홈/주말/블로그/지역/테마처럼 실제 festivals 데이터를 반영하는 페이지는 그대로 유지. `tests/sitemap-lastmod.test.ts` 2건 추가, 실제 `/sitemap.xml` 응답으로 검증
- Phase G 9.4: `components/festival/EventSchema.tsx` 검토 결과 — 허위 시간(00:00) 주입 없음, `feeIsFree`가 명시적으로 true일 때만 무료 표기, cancelled만 EventCancelled로 매핑하고 나머지는 EventScheduled(존재하지 않는 EventCompleted 같은 값 발명 안 함), organizer/좌표/이미지 모두 값 있을 때만 포함 — 이미 지시서 기준에 부합해 **수정 불필요**로 확인(변경 없음)

## P1-3 (완료, 2026-09-12 같은 세션 4차) — 광고 제외 규칙 통합
- Phase H / OBS-07: `components/affiliate/CoupangAffiliateBanner.tsx`는 이미 `/privacy`,`/terms`,`/contact`에서 배너를 숨기고 `rel="sponsored nofollow"`를 적용하고 있어 **그 자체는 문제 없음** — 확인만 하고 로직은 유지
- 다만 `components/ads/AutoAds.tsx`(구글 애드센스 Auto ads 스크립트)는 `app/layout.tsx` 루트에 예외 없이 로드되고 있어 정책/문의 페이지에도 광고가 붙을 수 있었다. `lib/ad-eligibility.ts`에 `isAdExcludedPath` 공통 규칙을 만들어 두 컴포넌트가 같은 제외 목록(`/admin`,`/privacy`,`/terms`,`/contact`,`/data-policy`)을 쓰도록 통합. `AutoAds`를 client component로 바꿔 해당 경로에서는 애드센스 스크립트 자체를 로드하지 않음(수동 슬롯만 숨기는 것과 다름 — 문서 10.1절 지적사항)
- 테스트: `tests/ad-eligibility.test.ts` 추가, 5개 페이지 실제 200 응답 확인
- 남은 갭: 존재하지 않는 URL(404 `not-found`)은 고정 경로 목록으로 잡을 수 없어 이번 배치에서 광고 제외 대상에 포함하지 못함 — 필요하면 404 페이지 전용 레이아웃/분리 렌더링으로 별도 처리 필요(backlog)

## P1-4 (완료, 2026-09-12 같은 세션 5차) — 주말 범위 계산 타임존 버그
- Phase D / T1-03·T1-04: `app/page.tsx`와 `app/weekend/page.tsx`가 각자 따로 구현한 `getThisWeekend()`가 `Date.getUTCDay()`/`setUTCDate()`로 "이번 주말"을 계산하고 있었다. 이는 `currentFestivalCondition()`이 이미 Asia/Seoul 기준으로 고친 것과 어긋나며, UTC 자정과 Seoul 자정이 9시간 차이나는 탓에 00:00~09:00 KST 구간에서 토·일 날짜가 하루 밀려 표시되는 실제 버그였다(예: 2026-09-12 03:00 KST(토요일)를 UTC 요일로는 여전히 금요일로 계산해 "이번 주말"이 09-13~09-14로 잘못 나옴)
- `lib/current-festivals.ts`에 Asia/Seoul 캘린더 기준 `getWeekendRange()` 공통 함수를 추가하고, 홈/주말 페이지의 중복 구현을 제거해 하나로 통합(문서 6.3절 "같은 함수를 재사용" 요구사항)
- 테스트: `tests/weekend-range.test.ts` 4건(자정 경계, 평일, 일요일, 토요일 각각) 추가. 실제 서버 시각(2026-09-12, 실제 토요일)으로 라이브 확인 시 "2026-09-12 ~ 2026-09-13" 정상 표시

## P1 (backlog) — 나머지
- Phase B: `publicationState` / `indexability` / `adEligibility` / `recommendationEligibility` 4상태 분리 + `lifecycle`(upcoming/ongoing/ended/cancelled/postponed/unknown) 도입. 스키마 마이그레이션 필요 — 별도 plan 승인 후 진행
- Phase D 나머지: 상설/반복 행사 운영요일 처리(T1-05, 스키마에 운영요일 필드 없음 — Phase B와 함께 다뤄야 함), 연도·회차 표기(6.2절)
- Phase F: 페이지 유형별 공개/색인/보존 정책 표 적용

## P2 (backlog) — 콘텐츠 구조·신뢰성·성능
- Phase I: 홈/상세 정보 순서 재검토, `/blog`를 실제 편집 콘텐츠 시스템으로 전환(현재는 festivals 목록을 blog로 노출 — OBS-06)
- Phase J: About/Contact/Privacy/Terms/Data-policy 실제 운영과 일치 여부 검증, 이미지 출처·권리 추적
- Phase K: 수집·캐시·운영 안정성(재시도, upsert, stale 데이터 처리)
- Phase L: 성능·접근성·모바일 검증

## 진행 방식
각 P1/P2 항목은 착수 전 별도 세션에서 감사(CONFIRMED/SUSPECTED 구분) → plan mode 승인 → 구현 → 테스트 순서로 진행한다. 한 번에 하나의 항목만 다룬다.
