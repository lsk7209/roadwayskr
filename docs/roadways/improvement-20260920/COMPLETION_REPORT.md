# roadways.kr 개선 결과 — 2026-09-20

## 1. 이번 작업의 실제 범위

- 환경: `E:\web\roadwayskr`, `main`, 기준 `f2c717b6201a2671d420ffee101aab7feb29be86`. Node 24.12.0, pnpm 10.33.0, Next.js 15.5.18, React 19, Drizzle/libSQL. 검증 시각은 2026-09-20 오전 KST이며 각 JSON에 UTC 관측 시각을 기록했다.
- `ddd/00..06`의 RW-00~14를 로컬 구현·검증하고 결과를 분류했다. 새 의존성·DB 스키마 변경 없음. 변경은 미커밋 상태다.
- 운영 배포·Git push·Vercel 변경·운영 DB 변경·수집/백필·검색엔진 알림·계정 설정·외부 메시지 전송은 실행하지 않았다.
- 기존 `STATUS.md`는 작업 전 백업과 SHA256이 일치한다. 사용자 제공 `ddd/`도 수정하지 않았다. 기존 변경 백업: `.goal-harness/preexisting.patch`, `.goal-harness/STATUS.preexisting.md`.
- 원본 `local.db` 193행은 읽기 전용으로 확인했다. 별도 `.goal-harness/test-data.db`는 원본 복사본과 명시적인 가상 72행, 총 265행이다. 원본에 없는 229054/3359644는 보호 경로의 라우팅 시험용 가상 행이며 실제 행사 데이터 검증으로 계산하지 않았다.
- 공개 기준선은 12페이지의 HTML 읽기만 수행했다. 최종 브라우저는 localhost 전용이며 실제 광고 대신 DOM 삽입 모형을 사용했다. 초기 브라우저 라우트 glob 설정이 하위 경로를 놓쳐 더미 publisher ID의 광고 JS 요청이 한 번 발생했다. 이후 모든 외부 요청을 차단하고 확인된 글꼴만 허용했다. 광고 클릭·운영 분석 이벤트 전송은 없었다.

## 2. 핵심 결과

날짜 파싱·표시를 통합하고 목록/상세를 요청 시 조회하도록 바꿨다. 주말 총계는 60개 선절단 없이 필터된 전체에서 집계하고, 지역별 미리보기와 실제 총계를 구분한다. 지역·월별·테마 목록에 안정적인 정렬과 24개 페이지네이션을 적용했다. 선택한 날짜와 페이지는 상세 방문·복귀·새로고침에도 유지된다.

행사 기간과 실제 운영일을 구분했다. 새연교 금·토 일정, 남산/보신각의 프로그램별 장소·시간·주의 공지, 석계역의 특정 행사 공지에 출처와 확인 범위를 붙였다. 미확인 정보를 무료·매일·오늘 운영으로 바꾸지 않는다. 수집기의 편집 메모·기존 slug·색인 결정·취소 상태 보존과 의미 있는 변경일 처리를 보완했다.

정책·빈 목록·오류 화면에는 광고 컴포넌트를 넣지 않고, Auto Ads가 로드된 문서는 내부 이동·history 이동에서 교체한다. 상세 제휴 배너는 본문 뒤에 배치했다. 없는 저장 기능의 하트, 무차별 추천 표시, 과장된 문구를 제거하고 메뉴·개인정보 고지를 실제 기능과 맞췄다.

최종 검증: **37/37 테스트, lint, typecheck, 격리된 production build, 25개 HTTP 검사, 13개 브라우저 assertion 통과**. 공식 계정/CMP/실제 광고 배치/Google 색인/운영 데이터 변경 후 정합성은 이 결과에 포함하지 않는다.

## 3. 작업별 결과

| 작업 | 감사 근거 | 현재 재현 | 원인·변경 | 테스트 | 최종 상태 | 남은 일 |
|---|---|---|---|---|---|---|
| RW-00 | 감사 범위 | REPRODUCED | 기존 변경·로컬 DB·실행 환경·공개 HTML 기준선 분리 | T00,T01 | FIXED_VERIFIED | 운영 동일 데이터 비교 |
| RW-01 | F02 | REPRODUCED(코드), 실제 229054 로컬 누락 | 빈 날짜의 null 병합 오류, 소개 날짜 fallback, 잘못된 날짜 차단, 공통 표시와 동적 조회 | T02,T03 | PARTIAL | 운영 누락 날짜 후보·수집 이력 대조, 승인 후 별도 백필 |
| RW-02 | F02,F03 | REPRODUCED(60개 제한); 서울 39/46은 NOT_REPRODUCED | 필터 후 전체 SQL 집계, 미매핑 그룹, 전체/미리보기 구별, 24개 페이지 | T04,T05 | FIXED_VERIFIED | 운영 대량 데이터의 성능 관측 |
| RW-03 | F03 | REPRODUCED | 절대 날짜 query 유지, 압축 날짜 ISO 정규화, 페이지·복귀 경로 보존 | T06 | FIXED_VERIFIED | 없음(로컬 범위) |
| RW-04 | F04,F05 | REPRODUCED | KST, 일요일에도 같은 주말, 기간/회차 구분, 미확인 상태, 출처가 있는 반복 요일 | T07,T08,T09 | PARTIAL | 전체 행사 운영 요일 및 개별 취소 자료 없음 |
| RW-05 | F06 | REPRODUCED | 2809535를 3개 프로그램 안내로 보강, 주소가 확인된 2개 지도 분리 | T09,T10 | FIXED_VERIFIED | 전통공연 상세 주소와 보신각 전체 취소일은 미확인 |
| RW-06 | F07,F10 | REPRODUCED | 링크 의미·대조 범위 표시, 수집일/변경일 구분, importer 편집 결정·slug 보존, 프로그램 변경 감지 | T10,T11 | PARTIAL | 실제 importer 운영 실행·전체 외부 링크 검증 미실행 |
| RW-07 | F01,F08 | REPRODUCED | 과거 월 기간 보존, 기간 분류 4개, 존재하는 인접 월·이번/다음 달 링크 | T12 | FIXED_VERIFIED | 전체 과거 월 sitemap 확장은 수행하지 않음 |
| RW-08 | F09 | REPRODUCED | 최근 소식 메뉴, 근거 없는 배지/하트/문구 제거, 모바일 줄바꿈, 글꼴 404 수정 | T13,T20 | FIXED_VERIFIED | 보조기기 전체 접근성 감사 미실행 |
| RW-09 | 기술 QA | REPRODUCED | 한글 alias 안전한 308, invalid 404, 공통 날짜 schema, 가짜 재고/요금 제거, JSON-LD escaping, 실제 lastmod | T14~T16 | PARTIAL | Rich Results 외부 검사·GSC 색인 미확인 |
| RW-10 | F11 | UNKNOWN(실계정), 모형 재현 | 페이지 콘텐츠별 허용, 빈/오류 제외, 문서 교체로 잔류 방지, 제휴 고지 유지 | T17 | PARTIAL | 실제 AdSense 삽입 위치·국가별/CMP 확인 |
| RW-11 | F12 | REPRODUCED(고지) | 없는 입력 폼·임의 보관기간·응답기한 제거, 도구/이메일 처리 고지 | T18 | PARTIAL | 운영자 보관기간·연락처 수신·법적 고지 확정 |
| RW-12 | F13 | REPRODUCED(기능 이벤트 없음) | 기존 gtag가 있을 때만 공식 안내/지도 event, ID·페이지 종류만 전송, 로컬 차단 | T19 | PARTIAL | 현재 GA measurement ID 없음, 실태그/동의/중복 확인 필요 |
| RW-13 | 추가 후보 | UNKNOWN(2개 ID), REPRODUCED(테마 토큰) | 불꽃/눈꽃을 꽃축제로 분류하지 않음, 후보별 보수적 판정, 대량 변경 없음 | T21 | PARTIAL | 운영 후보 자료·이미지 권리 근거 필요 |
| RW-14 | 전체 | REPRODUCED | 실제 실패→수정→재검증, 독립 검토, 이 보고서와 durable handoff | T00~T21 | FIXED_VERIFIED | 배포·계정 단계 별도 |

## 4. 변경 파일

전체 실제 경로와 SHA256은 [changed-files.json](changed-files.json)에 기록한다. `STATUS.md`와 `ddd/`는 작업 변경 목록에서 제외했다.

| 실제 파일/묶음 | 수정 이유·영향 | 되돌리는 방법 |
|---|---|---|
| `lib/festival-dates.ts`, `festival-facts.ts`, `festival-list.ts`, `event-source-notes.ts` | 날짜·SQL 집계·출처 기반 일정의 공통 구현 | 새 파일을 참조하는 이번 diff와 함께 제거 |
| `lib/current-festivals.ts`, `lib/regions.ts`, `lib/tourapi/normalizer.ts`, `lib/tourapi/merge.ts`, `scripts/sync-tourapi.ts` | 주말/별칭·날짜/요금·편집 보존·변경 URL | 해당 파일의 작업 diff만 역적용, 수집 미실행으로 DB 롤백 없음 |
| `app/page.tsx`, `app/blog/page.tsx`, `app/weekend/page.tsx`, `app/regions/page.tsx`, `app/regions/[areaSlug]/page.tsx`, `app/monthly/[year]/[month]/[areaSlug]/page.tsx`, `app/themes/[themeSlug]/page.tsx` | 조회·총계·페이지·아카이브·탐색·문구 | 해당 화면 diff만 역적용 |
| `app/festivals/[contentId]/[slug]/page.tsx`, `opengraph-image.tsx`(동일 폴더) | 동적 사실 조회, canonical, 출처/프로그램 지도, 광고 위치, Node OG runtime | 해당 상세 라우트 diff 역적용 |
| `components/festival/FestivalListCard.tsx`, `InfoCards.tsx`, `EventSchema.tsx`, `FestivalLink.tsx`, `BackToList.tsx`, `ListNavigation.tsx`, `components/seo/JsonLd.tsx` | 공통 표시·복귀·schema | 화면 호출부와 함께 역적용 |
| `components/ads/AutoAds.tsx`, `AdDocumentGuard.tsx`, `PageAds.tsx`, `components/affiliate/CoupangAffiliateBanner.tsx`, `app/layout.tsx` | 광고 조건·문서 이동·메뉴·모바일 footer | 광고/레이아웃 변경을 한 묶음으로 역적용 |
| `lib/analytics.ts`, `components/analytics/TrackedLink.tsx`, `app/privacy/page.tsx`, `app/contact/page.tsx` | 최소 이벤트·사실 고지 | 호출부 포함 역적용; 계정 설정 변경 없음 |
| `app/sitemap.ts`, `app/globals.css`, `eslint.config.mjs`, `.gitignore` | 실제 lastmod, 글꼴 URL, pnpm lint 해석, 로컬 브라우저 산출물 제외 | 각 diff 역적용 |
| `tests/current-festivals.test.ts`, `tests/weekend-range.test.ts`, `tests/theme-classification.test.ts`, `tests/festival-facts.test.ts`, `tests/roadways-acceptance.test.ts` | 동작 계약 회귀 검사 | 제품 변경과 함께 관리 |
| `scripts/roadways-local.mjs`, `roadways-public-check.mjs`, `roadways-route-check.mjs`, `roadways-fixture.py`(모두 scripts 폴더) | 격리 환경 재현·HTTP 증거 | 테스트 도구만 제거 가능, 원본 DB 변경 없음 |
| `.goal-harness/`, `docs/HANDOFF.md`, 이 보고서 폴더 | 상태·증거·복구 기록 | 이전 handoff는 아래에 유지; 증거는 보관 권장 |

## 5. 테스트 실행 결과

공통 환경은 2026-09-20 KST, Windows 로컬이다. `pnpm test` 37/37, `pnpm lint`, `pnpm typecheck`, `git diff --check` 모두 통과했다. `node scripts/roadways-local.mjs build`는 운영 연결을 덮어쓴 격리 DB로 통과했다. 로그는 `.goal-harness/final-*.log`에 있다. 원래 26개 테스트가 통과했던 기준선에서 날짜·가격·테마·압축 query·프로그램 변경 회귀를 먼저 실패시킨 뒤 수정했다.

| ID | 명령·도구/환경 | 결과 | 실제 증거 또는 한계 |
|---|---|---|---|
| T00 | git, PowerShell SHA256, SQLite read-only | PASS | 사용자 STATUS 백업과 동일; 원본193행; 운영 mutation 없음 |
| T01 | public-check / route-check | PASS(로컬 라우팅), NOT_RUN(동일 운영 DB) | 보호8+추가4의 before/after JSON. 강원 noindex 차이는 아래 별도 표시 |
| T02 | 단위 + HTTP /regions/충청남도, ID229054 detail | PASS(가상) | 10/1~10/5 일치; 실제 운영 ID 재수집·캐시 갱신 실험은 NOT_RUN |
| T03 | `pnpm test` | PASS | 빈값·부분·역전·불가능 날짜·intro fallback·혼합 요금 |
| T04 | in-memory 실제 Drizzle SQL | PASS | fixture5 = 서울2+경기1+제주1+미매핑1 |
| T05 | SQL + 브라우저 | PASS | 75행으로60개 제한 초과 검증, 2개씩 전 페이지 고유ID, 실제24개/page2 |
| T06 | Playwright | PASS | 주말→지역→2페이지→상세→복귀, 새로고침, browser back. 절대 날짜 query 유지 |
| T07 | 고정 시각 단위 | PASS | 공급 fixture 달력13case + 시간3case, KST 자정/월말/연말 |
| T08 | 단위 + 2434545 실제 로컬 표본 브라우저 | PASS | 일요일 주말 포함과 당일 일정 없음 분리; 금·토 안내 |
| T09 | 단위 + 2809535 HTML/브라우저 | PASS(확인 범위) | 개별 취소 fixture, 3프로그램,2개 서로 다른 주소/지도; 현재 모든 취소일은 NOT_RUN |
| T10 | 공식 공개 출처 읽기 + 실제 href | PASS(3개 표본) | 아래 출처표; 나머지 링크는 등록 홈페이지로 중립 표시하며 전체 검증은 NOT_RUN |
| T11 | merge 단위 + sitemap 기존 테스트 | PASS(로컬) | 동일내용 lastmod 유지, 변경 감지, 메모/색인/취소/slug 보존. 실제 수집은 NOT_RUN |
| T12 | 월별 HTTP + SQL/단위 | PASS(로컬) | 과거기간 남음, 분류 상호배타, 보호 월 URL 목적 유지, 이번/다음 달 링크 |
| T13 | 소스 검사 + 브라우저 | PASS | 최근 소식 메뉴·실제 기간·배지/하트 제거 |
| T14 | `node scripts/roadways-route-check.mjs` | PASS | invalid7개404, 잘못된slug/퍼센트/지역별칭/09월4개308, 무한 redirect 없음 |
| T15 | 실제 localhost robots/sitemap + XML 파싱 | PASS(로컬) | robots asset 접근, sitemap XML·기존 포함 정책; Google 실제 색인은 NOT_RUN |
| T16 | HTTP JSON-LD parse/필드 assert | PASS(로컬), NOT_RUN(외부 검사기) | 알려진 기간·주소, 미확인 fee offer 생략, InStock 없음, 여러 프로그램의 단일Event 생략 |
| T17 | Playwright offline JS 삽입 모형 | PASS(모형), NOT_RUN(실광고/CMP) | 허용→정책→허용→history 정책, 직접 빈/404에서 loader·marker 잔류 없음 |
| T18 | 코드/정책 문구 대조 | PASS(코드), NOT_RUN(운영 절차) | 없는 폼/가짜 보관기간 제거; 운영자 보관·삭제·국가별 동의 확정 필요 |
| T19 | gtag mock 단위 | PASS(mock), NOT_RUN(실태그) | 행동당1회 ID/page_type만, localhost0회. 동의는 기존 태그가 담당, 설정 새로 만들지 않음 |
| T20 | Playwright 360/390/1280 + screenshot 시각 확인 | PASS(표본) | 주말3폭·상세360 가로넘침 없음, 키보드 링크 초점, 복귀/페이지 이동; 전체 WCAG 감사 아님 |
| T21 | 로컬 인벤토리 + 테마 회귀 | PASS(후보 분리), NOT_RUN(권리 적합성) | 후보2ID 원본 DB 부재, 대량 삭제/재분류 없음, 라이선스 적합 판정 없음 |

증거: [HTTP 검사](http-checks.json), [공개 기준선](public-before.json), [로컬 응답](local-after.json), `.goal-harness/browser-results.txt`(13 assertion), `.goal-harness/detail-browser.txt`. 화면은 `output/playwright/weekend-360.png`, `weekend-390.png`, `weekend-1280.png`, `multi-program-360.png`.

중간 실패도 기록한다. 첫 격리 빌드는 pnpm ESLint plugin 해석과 Edge OG의 file DB 비지원으로 실패해 경로 해석/Node runtime을 수정했다. 최종 HTTP 검사 중 한글 slug 비교와 raw Korean Location header 실패를 발견해 수정했다. 마지막 빌드는 27개 정적 페이지와 동적 목록/상세를 생성하며 통과했다. root OG의 기존 Edge runtime 경고는 남아 있다. 광고 모형의 차단 이미지와 의도한404 요청은 제품 오류로 세지 않았다.

독립 검토: Spark가 `Unknown model: gpt-5.3-codex-spark`로 시작되지 않아 동일한 탐색/검토 범위를 Luna max로 한 번씩 재시도했다. 검토가 지적한 압축 날짜, raw program 변경일, 보존 slug 알림, history 광고 잔류 4개를 수정했고 재검토에서 material finding은 없었다. 최종 증거는 main이 실제 검사했다.

## 6. 보호 URL 영향

**변경 전은 공개 운영, 변경 후는 서로 다른 로컬 데이터다. 전체 운영 본문/색인 보존 증명으로 확대하지 않는다.** 아래 8개 모두 canonical 문자열이 기준선과 같다. 광고 열은 실제 계정 노출이 아니라 로컬 콘텐츠 조건만 뜻한다.

| 기존 경로 | 공개 기준선 | 로컬 최종 | redirect/canonical | 광고 영향 | 결론 |
|---|---|---|---|---|---|
| `/monthly/2026/10/제주` | 200/index,10월목록 | 200/index,3건 | 동일/직접200 | 내용 있을 때 허용 | 월 목적 유지 |
| `/` | 200/index,홈 | 200/index,홈 | 동일/직접200 | 내용 있을 때 허용 | 진입 탐색 개선 |
| `/monthly/2026/9/서울` | 200/index,9월목록 | 200/index,9월목록 | 동일/직접200 | 내용 있을 때 허용 | 페이지로 전체 접근 |
| `/festivals/3359644/3359644-석계역-달빛야시장` | 200/index,실제행사 | 200/index,가상행 | 동일/직접200 | 내용 조건만 시험 | 운영 내용 정합성은 미확인 |
| `/monthly/2026/9/경기도` | 200/index,9월목록 | 200/index,9월목록 | 동일/직접200 | 내용 있을 때 허용 | 월 목적 유지 |
| `/monthly/2026/9/강원도` | 200/index,9월목록 | 200/noindex,1건 | 동일/직접200 | 1건도 별도 허용 | 기존 최소3건 색인 기준과 로컬 데이터 차이; 운영 동일 DB 재검증 필요 |
| `/festivals/229054/229054-지상군페스티벌` | 200/index,실제행사 | 200/index,가상행 | 동일/직접200 | 내용 조건만 시험 | 운영 내용 정합성은 미확인 |
| `/monthly/2026/11/서울` | 200/index,11월목록 | 200/index,11월목록 | 동일/직접200 | 내용 있을 때 허용 | 11월 목적 유지 |

추가 `/blog`, `/regions`, `/regions/서울`, `/weekend`도 전후200이다. 공개 서울 지역은 현재39/39로 과거39/46을 재현하지 않았다. 보호8개가 전체 유입 URL 목록이라는 주장은 하지 않는다. 색인 최소건수 정책·종료/취소 상세 정책은 기존 것을 유지했으며 URL별 일괄 noindex 변경은 하지 않았다.

## 7. 추가 확인·미결

| 항목 | 증거·이유 | 필요한 자료/권한 | 현재 영향·다른 작업 |
|---|---|---|---|
| 운영 데이터 재검증 | local193행과 공개 데이터 다름,229054/3359644 로컬 부재 | 운영 읽기 표본 및 변경 이력 | 이번 코드 검증은 가능, 실제 백필/수집은 별도 승인 |
| 과거 누락 날짜 | 표시층은 raw intro fallback, SQL 검색은 정규화 컬럼 사용 | 누락행 목록·원자료·백업 | 기존 DB 누락 컬럼의 검색 복구는 아직 미실행 |
| 취소 일정 | 보신각 공지 존재와 범위만 확인 | 주최 측 날짜별 최신 공지 | 행사 전체를 취소 처리하지 않고 해당 프로그램 경고 |
| 실제 광고/CMP | 코드/모형만 검증 | AdSense·동의 도구·지역별 브라우저 근거 | 계정 적합성·승인 가능성 미확인 |
| 개인정보 운영 | 메일·보관기간·삭제절차는 코드로 확정 불가 | 운영자 결정 및 연락처 확인 | 미확인 사실을 임의 고지하지 않음 |
| GA·Google | 로컬 measurement ID 없음, 주어진 property ID는 사용 안 함 | 실제 측정ID/기존 동의 설정·GSC | 실이벤트/색인 검증 미실행 |
| 동적 조회 부하 | 목록/상세 캐시 불일치 줄이기 위해 동적 조회 | 배포 후 응답시간·DB reads | 비용 발생 조작 없음; 성능 실측은 배포 뒤 필요 |
| 이미지 사용 권리 | API 제공과 개별 이미지 권리는 별개 | 원본 조건·권리 증빙 | 기존 이미지 신규 복제/재발행 없음, 적합 판정 안 함 |

콘텐츠 후보 판정: `3000221`, `3337617`은 원본 로컬 DB에 없으므로 **KEEP / 운영 존재·내용 확인 대기**다. `/themes/꽃축제`는 **IMPROVE**, 불꽃/눈꽃 토큰만으로 식물 꽃축제로 판단하지 않게 신규 정규화 경로를 수정했다. 기존 저장된 themes 값은 바꾸지 않았다. 계절성0건 월은 **KEEP**, 날짜 목적·탐색을 유지하며 빈 화면 광고를 제외했다. 8개 보호 URL은 모두 **KEEP_AND_IMPROVE**다. MERGE/UNPUBLISH/DELETE는 실행하지 않았다.

확인한 표본 출처:

- 새연교2026 기간과 금·토·기상 변경 안내는 [제주관광공사 행사 페이지](https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_300000000014207)에서 대조했다. 요금은 이 페이지가 확인한 항목에 포함하지 않았다.
- 보신각/남산봉수대/전통공연의 장소·시간·프로그램별 공지는 [행사 운영 사이트](https://namsanbongsu.kr/)에서 확인했다. 보신각 공지를 다른 프로그램 전체 취소로 확장하지 않았다.
- 석계역은 [노원구 행사 공지](https://www.nowon.kr/www/user/bbs/BD_selectBbs.do?q_bbsCode=1001&q_bbscttSn=20260819164642302&q_currPage=1&q_estnColumn1=11&q_rowPerPage=10&q_searchKeyTy=sj___1002&q_searchVal=&q_sortName=&q_sortOrder=)를 연결했다. DB 날짜나 장소를 임의 백필하지 않았다.
- schema 검토 기준은 [Google Event 문서](https://developers.google.com/search/docs/appearance/structured-data/event), 광고/고지 경계는 [AdSense 정책](https://support.google.com/adsense/answer/1348695?hl=en), [게시자 정책](https://support.google.com/publisherpolicies/answer/10437794?hl=en), [유럽 사용자 동의 안내](https://support.google.com/adsense/answer/7670013?hl=en)다. 문서 확인을 계정 통과로 표현하지 않는다.

## 8. 배포와 롤백 인계

- 제출 묶음은 현재 작업 diff와 새 파일이며 커밋/배포는 없다. `changed-files.json`으로 제품·테스트 파일의 내용 hash를 확인한다. 작업 전 기존 변경은 별도 백업에 보존했다.
- 재현: `pnpm test`, `pnpm lint`, `pnpm typecheck`; fixture가 없을 때만 `python scripts/roadways-fixture.py`; `node scripts/roadways-local.mjs build`, `node scripts/roadways-local.mjs start`; 다른 터미널에서 `node scripts/roadways-route-check.mjs`. 기존 fixture는 생성기가 덮어쓰지 않는다. 승인된 로컬 sample DB가 없으면 생성 단계는 중단한다.
- 브라우저 재현은 `playwright-cli -s=roadways-check open about:blank`, `.goal-harness/browser-check.js`를 `run-code`로 실행한다. `output/playwright` 폴더가 필요하다. 실제 광고 모형과 네트워크 차단을 먼저 설치하는 코드다. 이후 `eval 'window.__roadwaysChecks'`로 결과를 읽는다. 수동 live 광고 클릭을 하지 않는다.
- 환경변수 원본 파일 변경 없음. 격리 helper는 DB/분석/광고/수집/알림/cron 값을 자식 프로세스에서만 덮어쓴다. **현재 `.next`는 가상 DB로 검증한 산출물이므로 운영에 복사하지 않는다.** 승인된 배포 환경에서 소스로 새 빌드를 만들어야 한다.
- migration은 필요 없고 backfill·sync는 실행하지 않았다. 운영 날짜/테마 정리는 읽기 검토·백업·범위를 먼저 확정해야 한다.
- 롤백은 이번 코드 변경만 되돌린다. `STATUS.md`, `ddd/`, 원본 `local.db`, 기존 사용자 변경을 reset/clean 대상으로 삼지 않는다. 미래 커밋을 만들었다면 해당 커밋의 revert가 코드 롤백 단위다. 운영 데이터/계정 변경이 없어 그에 대한 롤백은 없다.
- 다음 단일 단계: 이 로컬 변경 묶음과 미결 표를 기준으로 **운영 데이터 동일 표본의 읽기 검증 및 배포 범위 결정**. 이후 명시적 배포 요청이 있어도 기본 경계는 GitHub push까지이며 직접 Vercel 조작은 별도 명시가 필요하다.
- 배포 후 계획(미실행): 보호8개·추가4개, 강원 월 색인 지시, 실제 목록 합계/상세 날짜, 광고 제외/뒤로가기, DB 응답시간을 확인한다. 자동 모니터링이나 성과 개선을 관측했다고 주장하지 않는다.
