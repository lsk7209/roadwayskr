/**
 * 여행고고 (gogotrip.kr) - DB 스키마
 *
 * - libSQL(Turso, SQLite 호환)이라 Postgres 기능(JSONB·TIMESTAMPTZ·gin·BIGSERIAL) 사용 불가.
 * - JSON은 text() 컬럼에 JSON.stringify로 저장.
 * - 타임스탬프는 integer(unix epoch ms)로 저장.
 * - 배열은 text() + JSON 직렬화 + 검색용 보조 컬럼(예: themes_csv)으로 우회.
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// 1) festivals - 행사 마스터
// ─────────────────────────────────────────────────────────────
export const festivals = sqliteTable(
  "festivals",
  {
    contentId: integer("content_id").primaryKey(), // TourAPI contentId
    source: text("source").notNull().default("tourapi"), // 'tourapi' | 'kopis' | 'manual'
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    overview: text("overview"), // TourAPI overview (긴 본문)

    startDate: text("start_date"), // 'YYYY-MM-DD' (검색·정렬·SQL date 함수 호환)
    endDate: text("end_date"),

    // 행정구역 코드 체계 (TourAPI v4)
    areaCode: text("area_code"), // 시도
    sigunguCode: text("sigungu_code"), // 시군구
    ldongRegnCd: text("ldong_regn_cd"), // 법정동 시도
    ldongSignguCd: text("ldong_signgu_cd"), // 법정동 시군구

    address: text("address"),
    addressDetail: text("address_detail"),
    lat: real("lat"),
    lng: real("lng"),

    imageUrl: text("image_url"),
    imageThumbnail: text("image_thumbnail"),
    sourceUrl: text("source_url"), // 원본 페이지 (있을 경우)

    // 분류 - JSON 배열로 직렬화 ("[\"벚꽃축제\",\"가족\"]")
    themesJson: text("themes_json"),
    themesCsv: text("themes_csv"), // LIKE 검색용 ",벚꽃축제,가족,"

    familyFriendly: integer("family_friendly", { mode: "boolean" }),
    petFriendly: integer("pet_friendly", { mode: "boolean" }),

    fee: text("fee"), // 입장료 원문
    feeIsFree: integer("fee_is_free", { mode: "boolean" }),

    organizer: text("organizer"),
    sponsor: text("sponsor"),
    eventPlace: text("event_place"),
    playTime: text("play_time"),
    useTime: text("use_time"),
    homepage: text("homepage"),
    tel: text("tel"),

    status: text("status").notNull().default("upcoming"),
    // 'upcoming' | 'ongoing' | 'ended' | 'cancelled'

    // 원본 백업 (변경 추적·디버깅)
    rawJson: text("raw_json"),

    // 큐레이터 한 줄 코멘트 (페르소나 톤, 페이지마다 다름)
    curatorNote: text("curator_note"),

    // pSEO 가드 신호
    isIndexable: integer("is_indexable", { mode: "boolean" })
      .notNull()
      .default(true),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    slugUq: uniqueIndex("festivals_slug_uq").on(t.slug),
    dateIdx: index("festivals_date_idx").on(t.startDate, t.endDate),
    areaIdx: index("festivals_area_idx").on(t.areaCode, t.sigunguCode),
    statusIdx: index("festivals_status_idx").on(t.status),
    ldongIdx: index("festivals_ldong_idx").on(t.ldongRegnCd, t.ldongSignguCd),
  }),
);

export type Festival = typeof festivals.$inferSelect;
export type NewFestival = typeof festivals.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 2) regions - 행정구역 (지역 허브 페이지 + 검색 보강)
// ─────────────────────────────────────────────────────────────
export const regions = sqliteTable(
  "regions",
  {
    code: text("code").primaryKey(), // areaCode 또는 areaCode-sigunguCode
    level: text("level").notNull(), // 'sido' | 'sigungu' | 'ldong'
    name: text("name").notNull(),
    parentCode: text("parent_code"),
    lat: real("lat"),
    lng: real("lng"),
    description: text("description"), // 큐레이터 작성 (지역 허브 페이지)
    slug: text("slug").notNull(),
  },
  (t) => ({
    slugUq: uniqueIndex("regions_slug_uq").on(t.slug),
    parentIdx: index("regions_parent_idx").on(t.parentCode),
    levelIdx: index("regions_level_idx").on(t.level),
  }),
);

export type Region = typeof regions.$inferSelect;

// ─────────────────────────────────────────────────────────────
// 3) sync_runs - 동기화 이력 (모니터링·디버깅)
// ─────────────────────────────────────────────────────────────
export const syncRuns = sqliteTable("sync_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(), // 'tourapi' | 'kopis'
  mode: text("mode").notNull(), // 'incremental' | 'full' | 'manual'
  ranAt: integer("ran_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  insertedCount: integer("inserted_count").notNull().default(0),
  updatedCount: integer("updated_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  notes: text("notes"),
  errorJson: text("error_json"),
});

// ─────────────────────────────────────────────────────────────
// 4) page_value - 매트릭스 셀 발행 결정 (Scaled Content Abuse 가드)
// ─────────────────────────────────────────────────────────────
export const pageValue = sqliteTable("page_value", {
  url: text("url").primaryKey(), // 정규화된 경로 ('/경기도/광주시', '/2026/5/경기도')
  matrixType: text("matrix_type").notNull(), // 'region' | 'theme' | 'month' | 'theme_month' | ...
  itemCount: integer("item_count").notNull().default(0),
  isIndexable: integer("is_indexable", { mode: "boolean" })
    .notNull()
    .default(false),
  lastEvaluated: integer("last_evaluated", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ─────────────────────────────────────────────────────────────
// 5) subscriptions - 알림 (2차 단계 구현 대비)
// ─────────────────────────────────────────────────────────────
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id"),
    channel: text("channel").notNull(), // 'webpush' | 'email' | 'kakao'
    targetType: text("target_type").notNull(), // 'festival' | 'region' | 'theme'
    targetId: text("target_id").notNull(),
    notifyDaysCsv: text("notify_days_csv").notNull().default("7,1,0"),
    endpoint: text("endpoint"), // 웹푸시 엔드포인트 등
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    userIdx: index("subscriptions_user_idx").on(t.userId),
    targetIdx: index("subscriptions_target_idx").on(t.targetType, t.targetId),
  }),
);
