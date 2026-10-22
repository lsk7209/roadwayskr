# roadways.kr codex 개선 명세 실행 결과 — 2026-09-30 (Asia/Seoul)

## 1. 기준

- 저장소: `lsk7209/roadwayskr` (GitHub) → 로컬 클론 `D:\web\roadwayskr-review`
- HEAD: `f48351d36669ff1ba6122b0e0481939ae8ee5b13` — "Improve festival discovery and data integrity"
  - 명세 문서(`roadways_codex_improvement_2026-09-30.md`)가 명시한 기준 SHA와 **정확히 일치**. 문서 작성 이후 새 커밋 없음. `git remote -v` 원문(토큰 포함 가능)은 출력하지 않았다.
- 작업 시작 시점: 2026-09-30 15:01 KST
- 검토한 기존 문서: `docs/HANDOFF.md`(2026-09-07~09-20 여러 checkpoint), `docs/roadways/improvement-20260920/COMPLETION_REPORT.md`, `STATUS.md`, `README.md`
- Node v24.13.0(LTS), pnpm 10.33.0. `pnpm install`로 해석된 실제 버전: Next 15.5.18, React 19.2.6, drizzle-orm 0.36.4, zod 3.25.76 (package.json의 `^` 범위와는 다름, 이번에 처음 확인).
- 사용자 개인 `ddd/`, `.env*`, `local.db`는 이 클론에 없음(원본 그대로, 손대지 않음). `STATUS.md`는 읽기만 하고 수정하지 않음.

## 2. 항목별 상태

| ID | 상태 | 근거 |
|---|---|---|
| RW30-00 | 해결 | HEAD가 문서 기준 SHA와 일치 확인. `git status --short`(작업 전 clean), `docs/HANDOFF.md`/`docs/roadways/` 전량 열람 완료. |
| RW30-01 | 해결 | `git ls-files ddd` 빈 결과, `pnpm test` 실행 시 `ENOENT: .../ddd/06_SYNTHETIC_TEST_FIXTURES.json` 실제 재현(전체 스위트 크래시). 순수 합성 fixture(`tests/fixtures/synthetic-test-fixtures.json`)를 신규 작성하고 테스트가 이를 참조하도록 경로 교체. 재현→수정→38/38(해당 파일)·최종 65/65 통과 확인. |
| RW30-02 | 해결 | `app/api/indexnow/route.ts`에 인증 전무(코드 확인). 실제로는 **어떤 코드도 이 엔드포인트를 호출하지 않음**(sync 스크립트는 `lib/search-indexing.ts`를 직접 호출)도 함께 확인. `CRON_SECRET` 재사용 인증, HTTPS+동일 origin+포트+무자격정보 검증, admin/api 경로 차단, 개수(1,000)/본문크기(256KB) 상한, provider별 8s timeout, accepted/failed 상태 구분 구현. RT-03~06 대응 테스트 7건 추가, mock fetch로만 검증(실제 외부 POST 없음). |
| RW30-03 | 재현 불가(코드 확인, 부분 해결 아님) | `scripts/sync-tourapi.ts` 코드 확인: `processed=limited.length/items.length` 정직 기록, `errorCount` 반영 등은 명세 우려보다 양호. `resultCode==="22"` 시 `break`는 실행됨. 영속 checkpoint/재처리 대기열 신설은 운영 Turso 접근·스키마 변경이 필요해 **이번 세션에서 구현하지 않음**(범위 밖 처리, 아래 6절 참고). |
| RW30-04 | 해결 | `lib/tourapi/client.ts` 코드 확인: timeout이 헤더까지만 커버(`clearTimeout` 조기 호출), `res.status >= 500`만 재시도(429 누락) 실제 확인. `finally`로 timer 정리, 429+`Retry-After` 지원, 4xx 영구오류 즉시 실패, 5xx/429만 재시도하도록 수정. 신규 테스트 6건(429 백오프, Retry-After, 4xx 무재시도, 5xx 예산 소진, body-timeout, timer 정리) 모두 실제 mock fetch로 검증. |
| RW30-05 | 해결 | `app/api/health/route.ts` 코드 확인: `festivalCount > 0 && errorCount === 0`만으로 정상 판정, `finishedAt`/최신성 미검사 실제 확인. `dbReachable`/`lastRunState`(none/running/success/partial/failed)/`lastCompletedSuccessAt`/`sourceAgeMs`/`backlog` 분리, 36h 경고·72h 실패(조정 가능 초안) 임계값 도입. 순수 판정 로직을 `lib/http/health-evaluation.ts`로 분리(Next.js route export 제약 회피 목적, mock 없이 단위테스트 가능). 신규 테스트 8건, 기존 `health-route.test.ts`의 `"fail"`→`"failed"` 문자열 통일(의미는 보존, 값 표기만 새 체계에 맞춤). |
| RW30-06 | 재현 불가(범위 밖) | `lib/tourapi/merge.ts`(`prepareFestivalUpdate`) 코드 확인: slug/curatorNote/isIndexable/cancelled 보존 확인(기존 T11 테스트 통과 유지). 필드별 값없음/빈값/삭제확인/충돌 상태 분리는 스키마 확장이 필요해 이번 세션에서 구현하지 않음. |
| RW30-07 | 해결 | `lib/search-indexing.ts` 코드 확인: Google/Bing 폐기 `ping?sitemap=` 실제 호출 확인(`BING_PING`, `GOOGLE_PING` 상수 존재, `notifySearchEngines`가 매번 호출). 완전 재작성: 폐기 ping 제거, IndexNow 호환 엔드포인트만 사용(api.indexnow.org + 네이버), `disabled/accepted_pending_validation/failed` 3상태 구분, 8s timeout, key 없으면 외부 요청 0. `lib/indexnow.ts`(`fireIndexNow`)는 어디서도 호출되지 않는 죽은 코드로 확인했으나 삭제는 범위 밖으로 보류. 신규 테스트 5건. |
| RW30-08 | 해결(확인만) | `.github/workflows/sync-tourapi.yml`은 `node-version: 20`(EOL) 명시 확인. 로컬 Node 24(LTS)에서 `pnpm install/test/typecheck/lint` 전부 통과 확인. **워크플로 YAML의 Node 버전 변경은 CI 설정 변경(승인 대상)이라 실행하지 않음**, 요구사항만 정리. |
| RW30-09 | 해결 | `components/festival/FestivalListCard.tsx` 코드 확인: `note?.recurrence` 존재 여부만으로 무조건 `"금·토 운영"` 하드코딩 실제 확인(유일하게 등록된 recurrence 데이터가 금·토였을 뿐, 코드 자체는 다른 요일이어도 금·토로 표시하는 구조였음). `lib/festival-dates.ts`에 `recurrenceLabel(recurrence)` 신규 함수 추가(`daily`/`iso_weekdays`/`unknown`/미정의 4가지 분기, 중복제거·정렬·범위밖값 방어). `FestivalListCard`가 이 함수를 사용하도록 교체. 신규 테스트 7건(금토/월수/매일/unknown/undefined/중복/범위밖) 전부 통과. |
| RW30-11 | 해결 | `app/robots.ts`, `app/feed.xml/route.ts` 코드 확인: 둘 다 `x-forwarded-host`/`host` 요청 헤더를 검증 없이 그대로 sitemap/host/feed-link 생성에 사용(호스트 스푸핑 시 검색엔진에 잘못된 도메인 노출 가능한 실제 코드 패턴). 두 파일 모두 요청 헤더 대신 `SITE_URL` 환경변수(다른 canonical/JSON-LD/sitemap이 이미 사용 중인 값)로 통일. 부수효과로 `/feed.xml`이 동적(ƒ)에서 정적(○)으로 전환됨(빌드 로그로 확인). |
| RW30-12 | 해결 | `app/sitemap.ts` 코드 확인: `getLatestFestivalUpdatedAt()`는 try 바깥, 동적 목록 조회는 `try{}catch{ /* skip */ }`로 감싸져 있어 **DB 실패와 정상 0건을 구분하지 못하고 조용히 정적 페이지만 반환**하는 실제 구조 확인. `try/catch` 제거하여 DB 오류가 그대로 propagate되도록 수정(Next.js가 5xx로 처리하게 됨) — 200 sitemap으로 오류를 숨기지 않음. 신규 테스트 2건(오류 propagate, 정상 0건과 오류 구분)으로 SQLite 레벨에서 두 케이스가 실제로 다르게 동작함을 확인. |
| RW30-13 | 해결 | `app/page.tsx` 코드 확인: `getThisWeekend()`/`getLatestEvents()`가 상호 독립인데 순차 `await`였음(실제 코드 확인) → `Promise.all`로 병렬화. `app/weekend/page.tsx`+`lib/festival-list.ts` 코드 확인: `festivalGroups()`가 이미 지역별 count를 GROUP BY로 계산한 뒤, 각 지역마다 `festivalPage()`를 다시 불러 count(*)를 재계산하는 실제 `1+2G` 쿼리 구조 확인(G=지역수). `festivalPage()`에 `knownTotal` 옵션 추가해 중복 count 쿼리를 건너뛰도록 하고, weekend page가 `festivalGroups()` 결과의 `group.count`를 전달하도록 수정 → `1+G`로 감소. `FestivalListCard`에 `sizes` prop 추가(기존엔 모든 사용처에 동일한 `sizes` 고정값 사용, 실제 grid는 홈/blog가 1/2/3/4열, weekend/regions/[areaSlug]/themes/[themeSlug]는 sm:2열로 서로 다름을 확인) → 부모 grid에 맞는 `sizes` 각각 전달. |
| RW30-14 | 확인 완료(패치 불필요) | `lib/analytics.ts`(`trackAction`), `components/analytics/TrackedLink.tsx`, 실제 호출부(`app/festivals/[contentId]/[slug]/page.tsx`) 코드 확인: hostname 검증·`Number.isSafeInteger` 검증·allowlist 이벤트(`map_open`/`official_link_open`)만 전송하는 구조 확인. `map_open`은 프로그램별로 독립 링크(상호 배타적 렌더 조건), `official_link_open`은 단일 사용처 — 중복 트리거 경로 없음을 실제 코드 추적으로 확인. 기존 T19 테스트가 이미 로컬 트래픽 제외·단일 이벤트 전송을 검증 중. **결함 미발견, 패치 없음.** |
| RW30-15 | 해결(부분) | `components/festival/InfoCards.tsx` 코드 확인: hint 텍스트가 실제로 `text-[10px]` 확인 → `text-[11px]` + `leading-snug`로 가독성 개선(10px 자체가 WCAG 위반이라고 단정하지 않되 가독성 개선은 명세가 요청한 범위). `components/festival/BackToList.tsx` 코드 확인: 기능(경로 검증 화이트리스트, sessionStorage 예외처리)은 이미 견고했으나 `aria-label` 부재, 클릭영역 패딩 없음 확인 → `aria-label="이전 목록으로 돌아가기"` 추가, `py-1`로 클릭영역 소폭 확대(44px 목표를 보장한다고 과장하지 않음). |
| RW30-16, RW30-17 | NOT_RUN | RW30-16(콘텐츠 가치 강화)은 실제 유입 데이터·공식 출처 대조가 필요해 코드 패치만으로 불가능한 영역, 이번 세션 미착수. RW30-17(문서 정리)은 `docs/HANDOFF.md`가 이미 여러 checkpoint를 시간순으로 누적한 형태를 유지 중이라 최소 개입 원칙상 이번 세션에서 추가 수정하지 않음. |

## 3. 변경 파일

| 경로 | 변경 이유 | 보존한 동작 |
|---|---|---|
| `app/api/indexnow/route.ts` | 인증·입력검증·상한·timeout 추가 (RW30-02) | 기존 응답 형태(submitted urls) 유지, provider 목록(네이버/Bing) 동일 |
| `lib/search-indexing.ts` | 폐기 ping 제거, 상태 구분 (RW30-07) | `notifySearchEngines(urls)` 시그니처 유지(반환형만 `void→NotifyResult[]`, 호출부는 반환값 미사용이라 무영향) |
| `lib/tourapi/client.ts` | timeout 범위 확장, 429 처리, 영구오류 즉시실패 (RW30-04) | `callTourApi`/`fetchFestivalDetail`/`fetchSyncList`/`fetchFestivals` 공개 시그니처 동일, 기존 identity/empty guard(T-tourapi-detail) 그대로 유지 |
| `app/api/health/route.ts` | DB reachable/freshness 분리 (RW30-05) | 인증(`isAuthorizedCronRequest`)·`no-store` 헤더·`missing_env` 우선검사 순서 유지 |
| `lib/http/health-evaluation.ts` (신규) | 순수 판정 로직 분리 (RW30-05, Next route export 제약 회피) | — |
| `lib/festival-dates.ts` | `recurrenceLabel()` 함수 추가 (RW30-09) | 기존 `scheduleOnDate`/`periodState`/`formatPeriod` 등 전부 그대로, 신규 export만 추가 |
| `components/festival/FestivalListCard.tsx` | 요일 문구를 `recurrenceLabel()` 기반으로 교체, `sizes` prop 추가 (RW30-09, RW30-13) | 기존 카드 마크업/클래스/이미지 fallback 유지, `sizes` 기본값은 기존 4열 그리드와 동등 |
| `app/robots.ts`, `app/feed.xml/route.ts` | 요청 Host 헤더 대신 `SITE_URL` 사용 (RW30-11) | robots 규칙(disallow/allow 목록)·feed XML 구조·아이템 필드 그대로 |
| `app/sitemap.ts` | DB 오류를 `try/catch`로 삼키지 않고 propagate (RW30-12) | 정적 페이지 목록·lastmod 계산 로직·45,000건 cap 그대로 |
| `app/page.tsx` | 독립 쿼리 2건 `Promise.all`로 병렬화 (RW30-13) | 렌더 결과·섹션 순서·조건부 렌더링 동일 |
| `lib/festival-list.ts` | `festivalPage()`에 `knownTotal` 옵션 추가 (RW30-13) | 옵션 미지정 시 기존 동작(count 쿼리 실행) 100% 동일, 하위호환 |
| `app/weekend/page.tsx` | `festivalGroups()`의 count를 `festivalPage()`에 재사용, 카드 `sizes` 지정 (RW30-13) | total/미리보기 개수·문구 동일 |
| `app/regions/[areaSlug]/page.tsx`, `app/themes/[themeSlug]/page.tsx` | 카드 `sizes`를 실제 `sm:grid-cols-2` grid에 맞게 지정 (RW30-13) | 페이지 로직·카운트·정렬 동일 |
| `components/festival/InfoCards.tsx` | hint 텍스트 10px→11px, `leading-snug` (RW30-15) | 카드 4개 구성·값 계산 로직 동일 |
| `components/festival/BackToList.tsx` | `aria-label` 추가, 클릭영역 패딩 (RW30-15) | 경로 화이트리스트 검증·sessionStorage 예외처리 동일 |
| `tests/roadways-acceptance.test.ts` | fixture 경로를 `../ddd/...`→`./fixtures/synthetic-test-fixtures.json`로 교체 (RW30-01) | 기존 `calendar_cases`/`calendar_events`/`time_window_cases`/`groups_fixture` 구조·전체 assertion 로직 100% 유지, 기대값 완화 없음 |
| `tests/health-route.test.ts` | `"fail"`→`"failed"` 문자열 통일 | 검증 대상(401 우선, missing_env reason)은 동일 |
| `tests/fixtures/synthetic-test-fixtures.json` (신규) | 순수 합성 데이터, 개인정보/실제 행사 미포함 | — |
| `tests/indexnow-route.test.ts`, `tests/search-indexing.test.ts`, `tests/tourapi-client-resilience.test.ts`, `tests/health-route-freshness.test.ts`, `tests/recurrence-label.test.ts`, `tests/sitemap-failure-propagation.test.ts` (신규) | RW30-02/04/05/07/09/12 회귀 테스트 | — |
| `docs/roadways/improvement-20260930/SCHEMA_PROPOSALS.md` (신규) | RW30-03/06 스키마 확장 초안 (제안, 미적용) | — |

## 4. 검증

| 명령 | 환경 | 종료코드 | 결과 |
|---|---|---|---|
| `pnpm install --frozen-lockfile` | Windows, Node 24.13.0, pnpm 10.33.0 | 0 | 정상 설치, lockfile 변경 없음 |
| `pnpm test` (수정 전, clean checkout) | 동일 | 1 | `ENOENT ddd/06_SYNTHETIC_TEST_FIXTURES.json`로 전체 스위트 크래시(31 tests, 1 fail — 파일 단위 크래시라 그 안의 다른 assertion 미실행) — **재현 완료** |
| `pnpm test` (RW30-02/04/05/07 완료 시점) | 동일 | 0 | 65 tests, 65 pass, 0 fail |
| `pnpm test` (RW30-09/12 포함 최종) | 동일 | 0 | 68 tests, 68 pass, 0 fail |
| `pnpm typecheck` | 동일 | 0 | 오류 없음 |
| `pnpm lint` | 동일 | 0 | 오류/경고 없음 |
| `git diff --check` | 동일 | 0 | 공백 오류 없음(CRLF 경고는 Windows core.autocrlf 정상 동작) |
| `next build` (격리, 순수 합성 SQLite) | `TOUR_API_SERVICE_KEY`/`INDEXNOW_KEY` 등 운영값 없음, `SITE_URL=https://roadways.kr` | 0(빌드 자체) | 27개 페이지 생성 성공. **`/feed.xml`이 host-header 의존성 제거로 동적(ƒ)→정적(○) 전환됨을 빌드 로그로 확인**(RW30-11 부수효과) |
| 격리 서버(`next start --port 3021`), 동일 fixture DB | 로컬 전용, 외부 미노출 | — | `GET /` 200, `GET /festivals/9900001/...`(합성행사) 200, `GET /sitemap.xml` 200(1705바이트), `GET /api/health`(무인증) 401, `GET /api/health`(인증) 503 with `missing_env`(로컬 세션 env 전달 이슈로 실제 판정 로직까지는 미도달 — 6절 기록) |

화면 검수: 실제 브라우저(Chrome DevTools 등) 스크린샷·키보드·반응형 검증은 **미실행(NOT_RUN)**. HTTP 상태코드/응답 바이트/빌드 로그 수준까지만 확인했다.

## 5. 데이터·보안·검색 영향

- 운영 DB에 대한 SELECT/UPDATE 없음. 이번 세션 전체가 로컬 클론 + 순수 합성 SQLite(`.goal-harness/test-data.db`, `.gitignore`로 제외됨)에서만 수행됨.
- `/api/indexnow`는 원래도 어떤 코드에서도 호출되지 않는 독립 엔드포인트였음(신규 확인 사실). 인증 추가로 실제 외부 노출 위험이 있었다면 그 위험이 제거됨. 실제 IndexNow/네이버/Bing으로의 외부 POST는 이번 세션에서 발생하지 않음(전부 mock fetch로 테스트).
- `notifySearchEngines` 변경으로 `scripts/sync-tourapi.ts:128` 실제 운영 실행 시(다음 스케줄 04:00 KST) 폐기된 Google/Bing ping이 더 이상 발생하지 않게 됨 — 이는 **코드 변경**이며, 실제 배포는 별도 승인 필요(git push 미실행).
- 수동 편집 보호(`prepareFestivalUpdate`의 slug/curatorNote/isIndexable/cancelled 보존)는 손대지 않았고 관련 기존 테스트(T11) 그대로 통과.
- 광고/분석/검색엔진으로의 실제 전송, 계정 설정 변경 없음.

## 6. 미해결 / 승인 대기

- **RW30-03 (증분 수집 checkpoint)**: 영속 checkpoint/재처리 대기열 신설은 `sync_runs` 스키마 확장(마이그레이션)과 실제 Turso 동작 검증이 필요. `docs/roadways/improvement-20260930/SCHEMA_PROPOSALS.md`에 제안 스키마(`sync_checkpoints`, `sync_deferred_items`)와 적용 범위를 초안으로 작성. **미적용**(db:generate/db:push 미실행).
- **RW30-06 (수동복구 필드별 상태 분리)**: `값없음/빈값/삭제확인/충돌` 세분화는 `festivals` 스키마 확장이 필요. 동일 문서에 `manualOverridesJson`/`scheduleReviewStatus` 제안 스키마 작성. **미적용.** 현재는 기존 보호 필드(slug/curatorNote/isIndexable/cancelled)만 보존되는 수준.
- **RW30-08**: `.github/workflows/sync-tourapi.yml`의 `node-version: 20`→24 변경은 CI 설정 변경이라 실행하지 않음. 로컬 Node 24 호환성은 확인됨(모든 명령 정상).
- **RW30-16 (콘텐츠 가치 강화)**: 실제 유입 상위 페이지(월별/상세)의 공식 출처 대조·올해/전년도 구분 강화는 개별 행사에 대한 실제 조사가 필요해 코드 패치만으로는 불가. 이번 세션 미착수.
- **RW30-17 (문서 정리)**: `docs/HANDOFF.md`가 여러 checkpoint를 누적한 현재 형태를 유지. 새 확정 상태 요약을 상단에 추가하는 것은 향후 별도 작업으로 남김(과거 기록 삭제 없이 진행 필요해 신중한 별도 검토 필요).
- health route 격리 서버 스모크에서 `TOUR_API_SERVICE_KEY`/`TURSO_AUTH_TOKEN` 값이 PowerShell 프로세스 환경변수 전달 과정에서 "unset"으로 인식된 사소한 로컬 검증 이슈 발견 — `evaluateHealth` 로직 자체의 결함이 아니라 로컬 검증 스크립트의 env 처리 방식에 대한 것으로, 운영 영향 없음.
- **git push, PR 생성, 배포, 운영 DB 접근, 실제 검색엔진 알림 전송은 전혀 실행하지 않았음.** 승인 시 이후 진행.

## 7. 롤백

- 코드: 이번 변경은 전부 미커밋 상태(`git status --short`로 확인). `git checkout -- <path>`로 개별 파일 원복 가능. 신규 파일(`lib/http/health-evaluation.ts`, `tests/fixtures/`, `tests/*.test.ts` 6건, `docs/roadways/improvement-20260930/`)은 삭제로 원복.
- 데이터: 운영 DB 변경 없음 → 데이터 롤백 대상 없음.
- 설정: 환경변수/CI/Vercel 설정 변경 없음 → 설정 롤백 대상 없음.
- 로컬 산출물: `.goal-harness/`(합성 DB, seed 스크립트)는 `.gitignore` 대상이라 저장소에 영향 없음. 필요시 폴더 삭제로 완전 정리 가능.

## 8. 다음 한 단계

이번 로컬 변경 묶음(RW30-00~02, 04, 05, 07, 09, 11, 12, 13, 15; RW30-14는 확인 후 결함 미발견) 전체에 대한 **실제 diff 검토**. 승인 시 다음 후보:
1. RW30-03/06 스키마 제안 검토 후 마이그레이션 작성 여부 결정
2. RW30-16/17(콘텐츠·문서) 착수 여부 결정
3. RW30-08 CI Node 버전 업그레이드 승인 여부 결정

현재 경계는 git push까지이며, 실제 push·PR 생성은 별도 명시적 승인이 필요.
