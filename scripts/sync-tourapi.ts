/**
 * TourAPI 변경분 ?�기??(incremental)
 *
 * ?�용:
 *   pnpm sync:tourapi              # ?�제 modified 분만 (cron??
 *   pnpm sync:tourapi:full         # ?�체 1?�치 (최초 ?�재??
 *   pnpm sync:tourapi:sample       # 검증용 20건만 ?�재
 *
 * - 변경분 = areaBasedSyncList2 (modifiedtime ?�후)
 * - �???��???�??detailCommon2 + detailIntro2 추�? ?�출 ???�규????upsert
 * - sync_runs ?�이블에 ?�력 기록
 * - ?�일 ?�출 ?�도(1�? 보호: ??�?sync??최�? 2,500 ??��까�?
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { festivals, syncRuns } from "../db/schema";
import {
  fetchSyncList,
  fetchFestivalDetail,
  fetchFestivals,
  normalizeFestival,
  TourApiError,
} from "../lib/tourapi";
import { notifySearchEngines } from "../lib/search-indexing";

type SyncMode = "incremental" | "full";

const MAX_ITEMS_PER_RUN = 2_500;
const RPS_DELAY_MS = 200; // 초당 ~5�? ???�도 ?�전 ?�역.
const DEFAULT_FULL_RANGE_DAYS = 365;

const options = parseOptions(process.argv.slice(2));

async function main() {
  console.log(
    `[sync-tourapi] mode=${options.mode} limit=${options.limit ?? "default"} startAt=${new Date().toISOString()}`,
  );

  validateEnvironment();

  const [run] = await db
    .insert(syncRuns)
    .values({ source: "tourapi", mode: options.mode })
    .returning();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const changedUrls = new Set<string>();
  const errorSamples: Array<{ contentId?: string; error: string }> = [];

  try {
    const items =
      options.mode === "full"
        ? await collectFullYear(options.from, options.to)
        : await collectIncremental();

    console.log(`[sync-tourapi] candidates=${items.length}`);

    const itemLimit = Math.min(options.limit ?? MAX_ITEMS_PER_RUN, MAX_ITEMS_PER_RUN);
    const limited = items.slice(0, itemLimit);
    if (limited.length < items.length) {
      console.warn(
        `[sync-tourapi] truncated: ${items.length} ??${limited.length} (?�도 보호)`,
      );
    }

    for (const base of limited) {
      try {
        const detail = await fetchFestivalDetail(base.contentid);
        await sleep(RPS_DELAY_MS);

        const normalized = normalizeFestival({
          base,
          common: detail.common,
          intro: detail.intro,
        });

        const result = await upsertFestival(normalized);
        if (result === "inserted" || result === "updated") {
          changedUrls.add(
            `${process.env.SITE_URL ?? "https://roadways.kr"}/festivals/${base.contentid}/${normalized.slug}`,
          );
        }
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      } catch (err) {
        errors++;
        errorSamples.push({
          contentId: base.contentid,
          error: err instanceof Error ? err.message : String(err),
        });
        if (err instanceof TourApiError && err.resultCode === "22") {
          console.error("[sync-tourapi] API ?�도 초과 - 중단");
          break;
        }
      }
    }

    await db
      .update(syncRuns)
      .set({
        finishedAt: new Date(),
        insertedCount: inserted,
        updatedCount: updated,
        skippedCount: skipped,
        errorCount: errors,
        notes: `processed=${limited.length}/${items.length}; range=${options.from ?? "auto"}..${options.to ?? "auto"}`,
        errorJson:
          errorSamples.length > 0
            ? JSON.stringify(errorSamples.slice(0, 20))
            : null,
      })
      .where(eq(syncRuns.id, run.id));

    console.log(
      `[sync-tourapi] done. inserted=${inserted} updated=${updated} skipped=${skipped} errors=${errors}`,
    );

    if (changedUrls.size > 0) {
      await notifySearchEngines([...changedUrls]);
    }
  } catch (fatal) {
    await db
      .update(syncRuns)
      .set({
        finishedAt: new Date(),
        insertedCount: inserted,
        updatedCount: updated,
        errorCount: errors + 1,
        notes: "FATAL",
        errorJson: JSON.stringify({
          error: fatal instanceof Error ? fatal.message : String(fatal),
        }),
      })
      .where(eq(syncRuns.id, run.id));
    console.error("[sync-tourapi] FATAL:", fatal);
    process.exitCode = 1;
  }
}

async function collectIncremental() {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const ymd = yesterday.toISOString().slice(0, 10).replace(/-/g, "");

  const all: Awaited<ReturnType<typeof fetchSyncList>>["items"] = [];
  let pageNo = 1;
  while (true) {
    const { items, totalCount } = await fetchSyncList(ymd, pageNo);
    all.push(...items);
    await sleep(RPS_DELAY_MS);
    if (all.length >= totalCount || items.length === 0) break;
    pageNo++;
    if (pageNo > 100) break; // safety
  }
  return all;
}

async function collectFullYear(from?: string, to?: string) {
  // ?�늘 ~ 12개월 ???�사 (?�체 ?�도)
  const today = new Date();
  const start = normalizeYmd(from) ?? today.toISOString().slice(0, 10).replace(/-/g, "");
  const end = normalizeYmd(to) ?? new Date(today.getTime() + DEFAULT_FULL_RANGE_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const all: Awaited<ReturnType<typeof fetchFestivals>>["items"] = [];
  let pageNo = 1;
  while (true) {
    const { items, totalCount } = await fetchFestivals({
      eventStartDate: start,
      eventEndDate: end,
      pageNo,
      numOfRows: 100,
    });
    all.push(...items);
    await sleep(RPS_DELAY_MS);
    if (all.length >= totalCount || items.length === 0) break;
    pageNo++;
    if (pageNo > 100) break;
  }
  return all;
}

function parseOptions(args: string[]) {
  const mode = readMode(args);
  const limit = readPositiveInteger(args, "--limit");
  const from = readString(args, "--from");
  const to = readString(args, "--to");

  return { mode, limit, from, to };
}

function readMode(args: string[]): SyncMode {
  const value = readString(args, "--mode") ?? "incremental";
  if (value === "incremental" || value === "full") return value;
  throw new Error(`Invalid --mode=${value}. Use incremental or full.`);
}

function readString(args: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function readPositiveInteger(args: string[], name: string): number | undefined {
  const value = readString(args, name);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function normalizeYmd(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/-/g, "");
  if (!/^\d{8}$/.test(normalized)) {
    throw new Error("Date options must be YYYYMMDD or YYYY-MM-DD.");
  }
  return normalized;
}

async function upsertFestival(row: typeof festivals.$inferInsert) {
  const contentId = row.contentId;
  if (typeof contentId !== "number") {
    throw new Error("contentId is required for festival upsert");
  }

  const existing = await db
    .select({ id: festivals.contentId })
    .from(festivals)
    .where(eq(festivals.contentId, contentId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(festivals).values(row);
    return "inserted" as const;
  }

  await db
    .update(festivals)
    .set({
      ...row,
      updatedAt: new Date(),
    })
    .where(eq(festivals.contentId, contentId));
  return "updated" as const;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function validateEnvironment() {
  if (!process.env.TOUR_API_SERVICE_KEY) {
    throw new Error("TOUR_API_SERVICE_KEY is required. Add it to .env.local.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

