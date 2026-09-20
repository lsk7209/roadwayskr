# 운영 데이터 대조·복구안 검증 — 2026-09-20

상태: **로컬 검증 완료 / 운영 DB 복구·Git push·배포 미실행**. 원래 RW-00..14 결과는 [COMPLETION_REPORT.md](COMPLETION_REPORT.md)에 보존했다. 이번 사용자 `ㄱㄱㄱ` 후속 범위는 동일 운영 데이터의 읽기 전용 대조와 출시 전 준비다.

## 확인 결과

- 기존 연결에서 festivals만 SELECT해 864행을 확보했다. 원본 스냅샷 SHA256: `c5360dbcc292b35a64d3ecd9c1cf061770a5ab33f1b35c15306436058adadc63`. 원본/복사 DB는 Git 무시 경로 `.goal-harness/private/`에 있으며 연결 정보는 출력하지 않았다.
- 동일 데이터의 로컬 응답과 공개 응답에서 보호 URL 8개의 HTTP 상태·canonical·robots가 일치했다. 이전 소형 fixture의 강원도 noindex 차이는 실제 데이터에서 재현되지 않았다. 공개·로컬 각 12경로 모두 HTTP 200.
- 운영 데이터 286건에는 시작일/종료일이 없었다. 지상군페스티벌 등 3건은 raw_json도 base만 포함했다. 공개 지상군 상세에는 캐시된 날짜·소개가 있지만 현재 DB에는 없어, 새 동적 상세 코드를 그대로 적용하면 정보가 줄 수 있다. **코드 검증 통과를 운영 출시 완료로 해석하면 안 된다.**
- TourAPI common/intro 총 6회 조회로 세 행사 상세를 얻지 못했다. 이후 진단 4회 중 알려진 정상 행의 표준 camelcase 요청은 성공했다. 총 10 GET이며 동기화는 실행하지 않았다. 빈 성공 응답이 정규화되어 기존 정보를 비우는 코드 경로는 확인했으나, 286건 모두의 역사적 원인으로 단정하지 않는다.
- main HEAD와 읽기 전용 원격 main 확인 결과는 모두 `f2c717b6201a2671d420ffee101aab7feb29be86`다. commit/stage/fetch/push는 하지 않았다.

## 추가 코드 수정

- `lib/tourapi/client.ts`: 양쪽 상세 응답을 스키마로 검사하고 요청 ID/행사 type을 대조한다. 빈 응답, 한쪽 누락, ID만 있는 객체, 공백만 있는 상세 필드, 알 수 없는 메타데이터만 있는 응답을 정규화·행사 upsert 전에 거절한다.
- `tests/tourapi-detail.test.ts`: mock fetch 10시나리오 회귀 검증. 최초 빈 응답과 추가 identity-only 케이스에서 RED를 확인한 뒤 수정했다. 실제 수집·DB 쓰기를 호출하는 테스트가 아니다.
- 상세 페이지 출처 링크를 `공식 안내·원자료`로 표시해 지자체 공지를 홈페이지로 잘못 부르지 않도록 조정했다.
- `.gitignore`: private 스냅샷 폴더와 `.env.*.local` 제외. 신규 패키지 없음.
- snapshot/상세 읽기/복사/복구 시뮬레이션/HTTP 검증 스크립트와 `roadways-local.mjs`의 dataset 선택을 추가했다. 복구 스크립트는 고정된 새 로컬 DB만 생성하며 운영 쓰기 기능은 없다.

## 정확한 3건 복구안

[data-repair-plan.json](data-repair-plan.json)은 필드별 제안과 보존 필드, 적용 전 조건을 담는다. [repair-simulation.json](repair-simulation.json)은 실제 로컬 적용 전후 값이다.

| 행사 | 공식 자료로 확인한 2026년 일정·장소 | 주요 조치 |
|---|---|---|
| 229054 지상군페스티벌 | 10/1–10/5, 09:00–17:00, 계룡대 활주로. [문화체육관광부](https://www.mcst.go.kr/site/s_culture/festival/festivalView.jsp?pRo=21&pSeq=12690) | 날짜·시간·무료 요금·주최·짧은 소개·출처 보완 |
| 3000221 은평청년축제 | 9/19, 13:00–18:00, 구파발역 앞 광장. [서울시 축제 안내](https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=650) | 날짜·시간·장소·문의·소개·출처 보완. 이전 녹번동 주소/좌표 제거. 요금은 미확인 유지 |
| 3337617 화성시 도농 어울림축제 | 9/19–9/20, 동탄 여울공원 음악분수 주변. [화성시 9/14 보도자료](https://www.hscity.go.kr/www/user/bbs/BD_selectBbs.do?q_bbsCode=1051&q_bbscttSn=20260914085216256) | 날짜·장소·소개·출처 보완. 시간·요금은 미확인 유지 |

로컬 복사본에서 864행 중 정확히 3행만 바뀌고 861행은 동일하다. content_id/title/slug/curator_note/is_indexable/raw_json/created_at/synced_at은 모두 보존됐다. 9/20 KST 기준 상태는 각각 예정/종료/진행 중이다. 원래 스냅샷과 parity.db는 수정하지 않았다. 로컬 복구 후 미기재 283건은 이번 복구 범위 밖이다. 지상군/화성의 기존 TourAPI 좌표는 신규 검증된 입구 좌표로 주장하지 않는다.

## 최신 검증

- `pnpm test`: 38/38 PASS. `pnpm lint`, `pnpm typecheck`, `git diff --check` PASS.
- `node scripts/roadways-local.mjs build snapshot`: 원본 864행 빌드 PASS.
- `node scripts/roadways-local.mjs build repaired`: 최종 코드+3건 로컬 복구 빌드 PASS, 정적 페이지 27개. 로그 `.goal-harness/repaired-final-build.log`.
- `node scripts/roadways-parity-check.mjs`: 32 assertions PASS. 보호 URL8 동일 데이터 metadata, 복구 후 canonical, 서울 전체/선택 기간의 모든 페이지 ID 순서·누락·중복, 세 상세의 날짜 schema·장소, 미확인 요금 생략 및 옛 은평 좌표 제거를 검증했다.
- 실제 브라우저 13 checks PASS: 서울 2페이지 15카드 + 세 상세의 날짜/장소 + 360/390/1280 가로 넘침. screenshots `output/playwright/parity-{contentId}-390.png`. 외부 요청은 탐색 전에 전부 차단했으므로 외부 이미지/폰트가 없고 폰트 경고는 예상된 차단 결과다. 광고/GA 실계정 검증이 아니다. 스크린샷은 최종 출처 문구 3개 변경 직전이며 최종 HTTP 재검증은 변경 이후다.
- 사용자 STATUS.md는 시작 시 백업과 SHA256 동일. ddd 파일은 수정하지 않았다.
- 독립 검토: Spark 시작 실패 `Unknown model gpt-5.3-codex-spark` 후 같은 읽기 전용 lane을 Luna max로 1회 대체. Git/CI/스테이징 위험 점검과 최신 수집 방어 코드 검토 완료. identity-only finding은 수정 후 재검토·테스트 통과.

## 남은 경계와 다음 행동

운영 DB 복구는 위 조건으로 완료됐다. 이후 재실행이나 롤백이 필요하면 새 SELECT로 현재 행을 다시 비교하고, 취소·편집·행 변경이 있으면 중단해야 한다. 상태/updated_at은 실행 시점으로 다시 계산해야 하며, 검증용 스냅샷 시각을 재사용하면 안 된다.

`fetchFestivalDetail`은 완전히 빈 상세를 막지만, 일부 값이 있는 응답에서 나머지 optional 필드를 비우는 정책은 바꾸지 않았다. 날짜 문자열의 의미 검증은 기존 normalizer가 담당한다. 따라서 모든 향후 원자료 결손을 해결했다고 주장하지 않는다. 283건은 추가 근거 없이 임의 복구하지 않는다.

GitHub CI에는 현재 테스트/lint/typecheck/build 전체를 강제하는 workflow가 없으며 Vercel Git integration도 미확인이다. Git 배포는 별도 범위다. 현재 `.next`는 로컬 repaired.db 빌드여서 배포 아티팩트로 재사용하면 안 된다. 향후 명시적 파일 목록으로만 staging하고 사용자 STATUS.md/ddd, private snapshot, DB, .env, 백업 patch를 제외해야 한다. `changed-files-continuation.json`은 검토용 코드 목록이며 자동 stage 명령이 아니다.

**미실행:** sync/backfill, push/배포/Vercel 변경, 광고 클릭, 실 analytics 이벤트, 알림/메시지 전송, AdSense/CMP/GSC·권한/저작권 검증. 운영 DB 3행 쓰기는 위 실행 결과에 기록했으며, 나머지 283건은 건드리지 않았다. 원본 local.db 및 사용자의 기존 작업은 유지했다.

단일 다음 단계: 코드 bundle을 stage/commit/push하고 배포할지 별도로 결정한다. 운영 DB의 나머지 283건 sync/backfill은 별도 범위다.

## 운영 복구 실행 결과 — 2026-09-20 12:34 KST

사용자의 후속 `ㄱㄱ`에 따라 위 계획의 3개 content_id만 운영 DB에 적용했다. 실행 전 최신 SELECT가 검토 스냅샷과 행 전체가 일치하는지 확인했고, 불일치·취소·편집 메모·기존 날짜가 있으면 중단하는 조건부 트랜잭션을 사용했다. before-image는 `.goal-harness/private/production-repair-before-2026-09-20T03-34-16.152Z.json`에 저장했고 after 검증은 `production-repair-after.json`에 저장했다.

재조회 결과 229054는 2026-10-01~05/예정, 3000221은 2026-09-19/종료, 3337617은 2026-09-19~20/진행 중이다. 286건이던 미기재 날짜 행은 283건으로 줄었다. 3000221의 기존 좌표는 제거됐고, 229054·3337617의 기존 좌표는 새 입구 좌표라고 주장하지 않아 보존했다. 운영 DB 쓰기는 완료됐지만 코드 변경은 아직 push/deploy하지 않았으므로 공개 사이트 캐시와 동적 상세가 즉시 동일해졌다고 주장하지 않는다. 롤백이 필요하면 before-image와 동일한 세 행을 별도 조건부 복원 절차로 검토해야 한다.

추가 검증: 운영 환경 변수를 읽는 `pnpm build`가 27개 정적 페이지와 타입 검사를 통과했다. 같은 운영 DB를 읽는 로컬 3021 서버에서 세 상세를 각각 HTTP 200으로 확인했고 날짜·장소가 모두 노출됐다. 3000221은 종료 행사이므로 `noindex, follow`, 나머지 두 건은 `index, follow`였다. 로컬 서버는 확인 직후 종료했다. 이 검증은 push·배포가 아니며 공개 URL의 캐시 갱신도 수행하지 않았다.
