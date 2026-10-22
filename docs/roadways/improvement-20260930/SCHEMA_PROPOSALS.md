# RW30-03 / RW30-06 스키마 확장 초안 (제안, 미적용)

이 문서는 **제안(P·Proposal)** 수준이다. 아래 스키마 변경은 로컬에 적용하지 않았고
(`db:generate`/`db:push` 미실행), 운영 DB에는 당연히 적용하지 않았다. 실제 적용은
별도 승인과 마이그레이션 검토가 필요하다.

## RW30-03: 증분 수집 checkpoint

### 배경

현재 `scripts/sync-tourapi.ts`의 `collectIncremental()`은 매 실행마다
"UTC 기준 어제"를 고정 시작점으로 삼는다. 영속 checkpoint가 없어:

- 이틀 연속 실행이 안 되면 그 사이 변경분이 영구적으로 누락될 수 있다.
- `MAX_ITEMS_PER_RUN`(2,500) 절단 시 남은 항목이 다음 실행에서 자동으로 재처리되지 않는다
  (다음 실행은 다시 "어제"부터 시작하므로 오늘 변경된 다른 항목과 경쟁한다).

### 제안 스키마

```ts
// db/schema.ts에 추가 제안 (미적용)
export const syncCheckpoints = sqliteTable("sync_checkpoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // 'tourapi'
  // 마지막으로 "충분히 완료된" 처리 구간의 끝 (겹침 허용을 위해 실제 처리
  // 완료 시각보다 하루 이전 값을 저장 — 날짜 단위 API 응답 특성 반영)
  lastCompletedThrough: text("last_completed_through").notNull(), // YYYYMMDD
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const syncDeferredItems = sqliteTable(
  "sync_deferred_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source").notNull(),
    contentId: integer("content_id").notNull(),
    reason: text("reason").notNull(), // 'quota_exceeded' | 'detail_failed' | 'truncated'
    attempts: integer("attempts").notNull().default(0),
    lastAttemptAt: integer("last_attempt_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    sourceContentIdx: uniqueIndex("sync_deferred_source_content_uq").on(
      t.source,
      t.contentId,
    ),
  }),
);
```

### 적용 시 변경 범위 (미실행)

1. `collectIncremental()`이 `syncCheckpoints`에서 마지막 완료 지점을 읽고,
   그 지점보다 1일 이전부터 겹쳐서 재조회(날짜 단위 API 해상도 대응).
2. 실행 종료 시 실제로 끝까지 처리된 경우에만 `lastCompletedThrough` 전진.
   `MAX_ITEMS_PER_RUN` 절단이나 resultCode 22(한도초과) 중단 시에는
   전진시키지 않고 남은 항목을 `syncDeferredItems`에 기록.
3. 다음 실행은 `syncDeferredItems`의 대기 항목을 우선 재처리.
4. `sync_runs.notes`의 `processed=X/Y` 문자열 포맷을 유지하되
   `deferred=N` 필드를 추가.

### 왜 지금 적용하지 않았는가

- 운영 Turso DB에 실제 마이그레이션(`db:push`)이 필요해 승인 대상.
- `collectIncremental`/`collectFullYear`의 페이지네이션 로직을 함께 재작성해야
  하며, 이는 실제 TourAPI 응답의 `arrange`/`modifiedtime` 의미를 운영 트래픽으로
  재확인하는 과정이 필요(명세 4장 RW30-03 요구사항 참고).

## RW30-06: 수동 복구값 보호 세분화

### 배경

`lib/tourapi/merge.ts`의 `prepareFestivalUpdate()`는 현재 `slug`,
`curatorNote`, `isIndexable`, `status(cancelled)` 4개 필드만 통째로 보존한다.
날짜·장소 등 다른 필드는 API 응답이 오면 그대로 덮어쓴다. 문제:

- 값이 없음(API가 필드를 안 줌) / 실제 빈 문자열 / 명시적 삭제 확인됨 /
  수동으로 보호된 값 을 구분하지 못한다.
- 같은 `contentId`로 다음 회차 데이터가 들어오면, 이전 회차의 `curatorNote`가
  새 회차에도 그대로 노출된다(회차 구분 없음).

### 제안 스키마

```ts
// festivals 테이블에 추가 제안 (미적용)
export const festivals = sqliteTable("festivals", {
  // ...기존 필드 유지...

  // 필드별 수동 보호 상태. JSON: { "startDate": { "protected": true,
  // "reason": "공식 공지 대조", "checkedAt": "2026-09-20" }, ... }
  manualOverridesJson: text("manual_overrides_json"),

  // API가 이전 값과 다른 기간을 보내왔을 때, 같은 회차 정정인지 다음 회차
  // 후보인지 아직 판단되지 않은 상태를 표시. null이면 검토 불필요.
  scheduleReviewStatus: text("schedule_review_status"), // 'needs_review' | null
  scheduleReviewNote: text("schedule_review_note"),
});
```

### 적용 시 변경 범위 (미실행)

1. `prepareFestivalUpdate()`가 `manualOverridesJson`에 `protected: true`로
   표시된 필드는 `incoming` 값이 있어도 덮어쓰지 않음(현재 4개 필드 하드코딩
   대신 범용 메커니즘으로 교체).
2. 기존 기간(`startDate`/`endDate`)과 incoming 기간이 크게 다를 경우
   (예: 겹치지 않는 기간) 자동 병합 대신 `scheduleReviewStatus='needs_review'`로
   표시하고 기존 값 유지. 운영자가 검토 후 수동으로 승인.
3. `curatorNote`는 여전히 보존하되, 검토 대기 상태에서는 상세 페이지에
   "이전 회차 참고 정보"로 표시(현재 회차 확정 정보와 구분).

### 왜 지금 적용하지 않았는가

- `manualOverridesJson`의 필드별 스키마와 UI(어느 화면에서 편집자가 이
  값을 설정하는지)가 아직 설계되지 않음 — 현재 저장소에 그런 편집 UI
  자체가 없다(TourAPI 자동 수집만 존재, 수동 편집은 과거 1회성 SQL
  UPDATE로 수행된 것으로 `docs/HANDOFF.md`에 기록되어 있음).
- 회차 판단 로직(같은 회차 정정 vs 다음 회차)은 실제 TourAPI 데이터
  패턴을 더 분석해야 정확한 휴리스틱을 만들 수 있음.

## 다음 단계 제안

두 스키마 모두 별도 PR로 분리해 제안하고, 사용자 승인 후:
1. `drizzle-kit generate`로 마이그레이션 파일 생성
2. 로컬 합성 DB에서 `drizzle-kit push` + 회귀 테스트
3. 운영 적용은 별도 배포 승인
