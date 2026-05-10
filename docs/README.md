# 여행고고 (gogotrip.kr)

전국 축제·행사 정보를 가족 단위 시점으로 큐레이션하는 pSEO 사이트.

- **스택**: Next.js 15 App Router · Drizzle ORM · Turso(libSQL) · Vercel · Tailwind v4
- **데이터**: 한국관광공사 TourAPI 4.0 (KorService2)
- **페르소나**: `personas/gogotrip.kr.json` (큐레이터: 고고지기)
- **목표**: AdSense 검수 통과 + March 2026 코어 업데이트 안전 + 월 PV 30만

---

## 셋업 (Day 1)

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수
```bash
cp .env.example .env.local
# 다음 값들을 채웁니다:
#   TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
#   TOUR_API_SERVICE_KEY  (https://www.data.go.kr 에서 신청, 자동 승인)
#   SITE_URL, INDEXNOW_KEY
```

### 3. Turso DB 준비
```bash
# Turso CLI로 DB 생성 (또는 web dashboard)
turso db create gogotrip
turso db tokens create gogotrip
turso db show gogotrip  # URL 복사

# 마이그레이션
pnpm db:generate
pnpm db:push
```

### 4. 첫 데이터 적재 (전체 1년치)
```bash
pnpm sync:tourapi:full
```
- 일일 한도(1만건) 보호를 위해 한 번에 최대 2,500건만 처리
- 부족하면 다음 날 다시 실행하면 자동 이어 적재

### 5. 개발 서버
```bash
pnpm dev
# http://localhost:3000
```

---

## 매일 자동 동기화

`.github/workflows/sync-tourapi.yml`이 매일 04:00 KST에 변경분만 가져옵니다.

GitHub Repository Secrets에 다음 값을 등록:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `TOUR_API_SERVICE_KEY`

---

## 주요 명령

| 명령 | 용도 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 (SSG: generateStaticParams로 행사 페이지 일괄 생성) |
| `pnpm db:push` | 스키마 변경 → DB 반영 |
| `pnpm db:studio` | Drizzle Studio (DB 브라우저) |
| `pnpm sync:tourapi` | 변경분 동기화 (cron용) |
| `pnpm sync:tourapi:full` | 1년치 전체 동기화 (최초/주기적) |
| `pnpm adsense:check` | AdSense 검수 준비도 22항목 자동 점검 |
| `pnpm typecheck` | 타입 체크 |

---

## 구조

```
gogotrip/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 + Organization Schema
│   ├── page.tsx                # 홈 (이번 주말)
│   ├── globals.css             # Tailwind v4 + 디자인 토큰
│   └── 축제/
│       └── [contentId]/[slug]/
│           └── page.tsx        # 행사 상세 (pSEO 핵심)
├── components/festival/
│   ├── InfoCards.tsx           # 4대 기본 정보 카드 (시그니처)
│   ├── EventSchema.tsx         # JSON-LD Event Schema
│   └── CuratorNote.tsx         # 큐레이터 한 줄 코멘트
├── db/
│   ├── schema.ts               # Drizzle 스키마 (festivals, regions, sync_runs, page_value, subscriptions)
│   ├── index.ts                # Drizzle 클라이언트
│   └── migrations/             # drizzle-kit 자동 생성
├── lib/tourapi/
│   ├── client.ts               # TourAPI HTTP 클라이언트 (rate limit + retry)
│   ├── normalizer.ts           # raw → DB 정규화 (테마 추출, 가족 가능 추론 등)
│   ├── types.ts                # Zod 스키마
│   └── index.ts
├── scripts/
│   └── sync-tourapi.ts         # 동기화 메인 (incremental | full)
├── personas/
│   └── gogotrip.kr.json        # 큐레이터 페르소나 (고고지기)
└── .github/workflows/
    └── sync-tourapi.yml        # 매일 04:00 KST cron
```

---

## 다음 단계 (Day 4~7) → ✅ Day 4~5 완료

### Day 4~5 완료 항목
- [x] 17개 시도 허브 페이지 (`app/지역/`, `app/지역/[areaSlug]`)
- [x] "이번 주말" 상시 페이지 (`app/이번주말`)
- [x] sitemap.xml (실제 lastmod 분산, isIndexable 항목만)
- [x] robots.txt
- [x] About / Contact / Privacy / Terms / 데이터 정책 5종
- [x] 큐레이터 페이지 (Person Schema)
- [x] 404 페이지
- [x] AdSense readiness 22항목 점검 스크립트 (`pnpm adsense:check`)
- [x] IndexNow ping 헬퍼 (`lib/indexnow.ts`)

### Day 6~7 (다음에 할 것)
- [ ] 시기 매트릭스 (`/[연도]/[월]/[지역]`)
- [ ] 테마 매트릭스 (`/테마/[테마]/[지역]`)
- [ ] 큐레이터 한 줄 코멘트 LLM 생성 (Gemini Flash)
- [ ] ads.txt 파일 (검수 신청 직전 publisher-id 발급 후 추가)
- [ ] AdSense Auto Ads 코드 주입 (검수 통과 후)
- [ ] Google Search Console 등록 + sitemap 제출
- [ ] 네이버 서치어드바이저 등록

각각의 작업이 검수 통과·트래픽·수익에 어떤 영향을 주는지는 `PRD_festival_pSEO.md` 참조.

---

## 주의사항

- **본문 콘텐츠 자동 생성 금지**: Scaled Content Abuse 정책 위반. 큐레이터 한 줄 코멘트만 LLM 생성, 그 외 본문은 TourAPI overview를 그대로 사용하거나 사람 손질.
- **셀당 최소 3건**: `page_value` 테이블에 매트릭스 셀의 행사 수를 기록하고, 3건 미만이면 `isIndexable=false`로 처리해 noindex.
- **sitemap lastmod 분산**: 모든 페이지가 같은 시각이면 자동 생성 의심. 실제 데이터 변경 시각으로 기록.
- **YMYL 아님**: 행사 정보는 의료·법률·금융이 아니라서 자동화 여지가 큼. 단 출처 표기는 강제.

---

## 문의·기여

- 큐레이터: 고고지기
- 사이트: https://gogotrip.kr
- 데이터 출처: 한국관광공사 TourAPI (Open Government License)
