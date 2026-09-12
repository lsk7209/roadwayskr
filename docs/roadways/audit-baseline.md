# roadways.kr 감사 기준선 (Phase A)

## 저장소 히스토리 참고 (2026-09-13)

이 작업은 원래 로컬 클론(`main`)에서 진행됐으나, 로컬 `main`과 `origin/main`이
공통 조상이 없는 완전히 무관한 히스토리(unrelated histories)인 것이 확인됐다.
`origin/main`이 실제 배포된 프로덕션 히스토리이며, 로컬 `main`은 과거 어느
시점 스냅샷에서 독립적으로 분기된 것으로 보인다(로컬에 `docs/gogotrip.tar.gz`,
`docs/mnt/user-data/outputs/...` 같은 아카이브 잔재가 남아있는 것과 일치).

`origin/main`에는 로컬에 없던 기능(`HubSourceGuide` 컴포넌트, 지역/테마 페이지의
`currentFestivalCondition()` 사용, 축제 상세 페이지의 cancelled+ended 동시 제외)이
이미 반영돼 있었다. 이 브랜치(`roadways-audit-fixes`)는 `origin/main`을 기준으로
새로 만들어, 아래 CONFIRMED 항목들만 origin의 실제 코드 위에 재적용한 것이다 —
origin에 이미 있던 기능을 되돌리지 않았는지 파일별로 직접 대조해 확인했다.

작성일: 2026-09-12 (Asia/Seoul). 외부에서 전달된 대규모 개선 지시서(18-Phase)의 관찰 항목을 실제 저장소 코드와 대조한 결과다. 저장소 확정 버그 목록이 아니라 이번 작업의 시작점이다.

## 확인 방법
- 코드 대조: `Read`/`Grep`으로 해당 파일의 실제 내용 확인
- Git 이력: `git log --oneline` 확인
- 네트워크/DNS/GSC/AdSense 계정 상태는 이번 감사에서 접근하지 않음(NEEDS_ACCESS)

## CONFIRMED

| ID | 상태 | 파일:라인 | 근거 |
|---|---|---|---|
| OBS-01 | CONFIRMED | `app/page.tsx:176-233` | "Roadways review and visitor guidance" 섹션이 영문으로 "AdSense reviewers"(202), "thin-page and low-value-content risk during AdSense review"(214-215), "doorway pages"(225), "AdSense review evidence"(228) 등 심사봇 대상 문구를 방문자 화면에 노출 |
| OBS-01b | CONFIRMED | `app/page.tsx:20` | `trustItems`의 "검수 리스크를 낮춥니다" — 한국어 버전에도 동일한 심사 지향 문구 |
| OBS-01c | CONFIRMED | `app/blog/page.tsx:13-17,42-46,74-75` | 영문 메타(title/description)와 본문에 "Crawlable links to recently updated festival and local event guides" 등 크롤러 대상 문구. 사이트 전체가 한국어인데 이 페이지만 영문 |
| OBS-03 | CONFIRMED | `app/plan/page.tsx` | 내부 SEO/애드센스/도메인 실행계획이 인증 없이 공개 라우트로 노출. 링크: `app/page.tsx:37-39,272-277`, `app/about/page.tsx:26`, `app/contact/page.tsx:36`. 색인 후보: `app/sitemap.ts:34`(priority 0.5). `middleware.ts` 확인 결과 인증/게이트 없음 |
| OBS-02 | CONFIRMED | `app/robots.ts` (`*` 그룹 disallow) | `/_next/`를 전면 차단. `next.config.ts:41-57`이 `/_next/static/*`, `/_next/image/*`에 실제 장기 캐시 헤더를 설정하는 것으로 보아 실제 공개 렌더링 리소스 경로 — JS/CSS 렌더링 신호를 막을 수 있는 안티패턴 |

## 2차 배치에서 추가로 CONFIRMED (2026-09-12, 같은 세션 연속)

| ID | 상태 | 파일:라인 | 근거 |
|---|---|---|---|
| OBS-05 | CONFIRMED (근본 원인 특정, 코드 수정 완료) | `lib/tourapi/normalizer.ts` `THEME_KEYWORD_MAP` | 과일축제 키워드에 1글자 "배"·"감"이 포함돼 "동선 배치 안내" 같은 무관한 문구에도 매칭됨(왕궁수문장 교대의식·DDP 건축투어가 과일축제로 노출된 원인). 음식축제의 "맛", 눈축제의 "눈"도 동일 문제. `tests/theme-classification.test.ts`로 재현·검증 |
| OBS-04 | CONFIRMED (코드 수정 완료) | `app/themes/[themeSlug]/page.tsx`, `app/regions/[areaSlug]/page.tsx` | `items.length`(LIMIT 80/60 적용된 배열 길이)를 total처럼 표시. 실제 `getCount()` 결과와 분리해 `lib/collection-count-label.ts`로 "총 N건 중 최신 M건 표시" 문구 도입 |
| www/non-www | CONFIRMED (코드 수정 완료) | `next.config.ts` | 실제 프로덕션 확인 결과 `https://www.roadways.kr/`가 리디렉션 없이 apex와 동일 콘텐츠를 200으로 직접 서빙(중복 호스트). `redirects()`에 host 기반 308 규칙 추가로 해결. 로컬에서 `Host: www.roadways.kr` 스푸핑으로 검증 완료 |

주의: OBS-05/OBS-04 수정은 **코드 로직**만 고친 것이다. `lib/tourapi/normalizer.ts`는 다음 TourAPI 동기화(`pnpm sync:tourapi*`) 때 새로 들어오는/갱신되는 행에만 적용된다. 실제 프로덕션 DB에 이미 저장된 기존 오분류 `themesCsv` 값은 재동기화 전까지 그대로 남아 있다(실제 `/themes/과일축제` 응답으로 확인). 재동기화는 운영 DB 쓰기 작업이라 이번 자동 진행 범위에서 실행하지 않았다 — `manual-actions.md` 참고.

## SUSPECTED / NEEDS_ACCESS (이번 배치에서 다루지 않음)

- OBS-06(`/blog`가 사실상 행사 목록 — 구조 자체는 유지, 문구만 P0-1에서 정리함), OBS-07(광고/쿠팡 배치) — Phase H/I 범위, 별도 조사 필요
- OBS-08(지역 명칭 대조): `lib/regions.ts`의 `AREAS`가 TourAPI areaCode 기준 17개 고정 목록이고 지역 페이지가 `areaCode` 정확히 일치로만 조회하므로("경기"/"경기도" 같은 별칭 중복 집계 코드가 없음), 코드 레벨에서는 **NOT_REPRODUCED**로 재분류. 다만 DB에 저장된 실제 `areaCode`/`address` 값이 최신 행정구역 코드와 어긋나는지는 DB 실측 없이는 확인 불가(NEEDS_ACCESS)
- GSC/AdSense 계정 설정, RAPBEAT 임의시간 문구 출처, DNS 소유권(도메인 자체는 정상 작동 확인됨 — 리디렉션 미비만 문제였음) — NEEDS_ACCESS (계정 권한 없음)

## Git 이력에서 확인되는 배경

`git log`에 다음 커밋이 존재하며, 이번 지시서가 금지하는 "심사봇에게 잘 보이기" 방향의 이전 작업 흔적으로 판단된다(제거 대상 아님, 배경 기록용):
- `5f7b7e4 Expose a crawlable blog archive for AdSense review`
- `b99f50b Clarify Roadways review value for crawlers`
- `8c37e76 Stabilize Roadways approval metadata`

## 범위

이번 배치(P0-1)는 위 CONFIRMED 5건(OBS-01/01b/01c/03/02)만 다룬다. 나머지는 `implementation-plan.md`의 backlog 참고.
