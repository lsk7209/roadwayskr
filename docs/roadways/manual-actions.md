# 수동 작업 / 계정 권한 필요 항목

## Vercel 계정 설정 필요 (2026-09-12, PR #1 확인 중 발견)

`roadways-audit-fixes` 브랜치의 Vercel Preview 배포가 빌드 실패했다. 원인은
코드가 아니라 **Preview 환경에 `TURSO_DATABASE_URL`이 설정돼 있지 않은 것**이다.
`vercel build` 로그: `Compiled successfully` → 타입체크 통과 → `Collecting page
data` 단계에서 `/sitemap.xml`이 DB 클라이언트를 초기화하다 `TURSO_DATABASE_URL is
not set`로 실패. `docs/HANDOFF.md`(2026-09-07)에도 동일한 제약이 이미 기록돼
있어 이번 코드 변경과 무관한 기존 환경 설정 갭으로 판단된다.

조치(Vercel 프로젝트 설정 접근 권한 필요, 계정 소유자만 가능):
- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서
  `TURSO_DATABASE_URL`(및 필요한 인증 토큰)을 **Preview** 환경에도 적용
- 또는 Production에만 필요한 값이라면, `app/sitemap.ts`처럼 DB 접근이 필요한
  라우트가 preview 빌드에서 실패하지 않도록 별도 처리가 필요한지 검토(이번
  작업 범위 밖 — 코드 변경으로 임의 처리하지 않았다)

## 승인 후 실행 필요 (2026-09-12 추가)

- **테마 재분류 백필**: `lib/tourapi/normalizer.ts`의 과일축제("배"·"감" 제거)/음식축제("맛" 제거)/눈축제("눈"→"눈꽃" 등 복합어) 키워드 수정은 코드에만 적용됐다. 실제 프로덕션 DB의 기존 `festivals.themesCsv`는 재동기화 전까지 옛 분류를 유지한다. `pnpm sync:tourapi:full` 실행은 운영 데이터를 갱신하는 작업이라 사용자 승인 후 진행한다. 실행 전 실제 영향받는 행 수(예: 과일축제로 잘못 태깅된 행) 조회로 dry-run 성격의 사전 확인을 권장한다.
- **www 리디렉션 배포 확인**: `next.config.ts`의 `redirects()`(www→apex 308)는 배포되어야 프로덕션에 적용된다. 배포 후 `curl -I https://www.roadways.kr/`로 308 응답을 재확인해야 한다.

## `/plan` 페이지에서 이관된 내용 (2026-09-12)

기존 `app/plan/page.tsx`는 인증 없이 공개된 내부 실행계획 페이지였다(OBS-03, `audit-baseline.md` 참고). 공개 라우트는 제거했고, 내용은 아래에 보존한다.

### 속도 최적화 (진행)
- 이미지 WebP/AVIF 최적화 및 LCP 이미지 우선순위 조정
- 불필요한 JS 분할 로딩, 정적 데이터 캐시 TTL 정리
- 메뉴/필터 API 호출은 1초당 중복 호출 제한
- 긴 목록 구간에 content-visibility 적용으로 초기 렌더링 축소

### SEO 최적화 (진행)
- 메타 제목/설명/정규 URL 통일 점검 및 중복 텍스트 정리
- JSON-LD 구조화 데이터 누락 페이지 보완(Organization, WebSite 중심)
- robots 규칙 정비(허용 봇/차단 봇 분리)
- sitemap/feed 생성 파라미터와 lastModified 최신성 점검

### 콘텐츠 최적화 (계획)
- 메인/주제 페이지 핵심 문안 정비(문단 가독성 기준 통일)
- 중요 키워드 하단 FAQ 섹션으로 정보 탐색 효율 강화
- 메뉴별 빈 페이지 유무 점검(권장 2개 이상 내부 링크 포함)

### AdSense / 수익화 (점검)
- 자동광고 방식 규정 충돌 항목 제거(과도한 광고 배치 금지)
- 본문과 광고의 간격/비율 균형(가독성 우선) 적용
- 앵커/버튼 문안이 사용자 유도형(클릭 유도 과다 문구 제외)
- 광고 스크립트 주입 지연/중복 로딩 중복 제거

### 빠른 점검 항목
- 사이트맵(`/sitemap.xml`): 최신 lastmod 존재 여부
- RSS(`/feed.xml`): 정상 XML 형식과 최신성
- robots(`/robots.txt`): 허용/차단 봇 정책 정합성
- 테마 페이지(`/themes`): 썸네일/카드 텍스트 깨짐 없음
- 지역 페이지(`/regions`): 빈 페이지/깨진 링크 제거

### 다음 실행 (우선순위) — 원문 그대로 보존, 계정 권한/사람 검토 필요
1. 도메인 라우팅 문제 해결 후 사이트맵/robots/feed/page 노출 재확인
2. 댓글 모듈 미포함 상태를 정책 반영 문서화(비노출 페이지는 작성 차단)
3. GA4 이벤트(CTA, 지도 열람, 페이지 체류) 최소 5개 표준 이벤트 정합성
4. GSC/네이버/다음 인덱싱 제출 후 오탐 로그 점검

이 항목들은 `implementation-plan.md`의 P1/P2 backlog와 중복되는 부분이 있다 — 실제 착수 시 그쪽 문서를 우선 기준으로 삼는다.
