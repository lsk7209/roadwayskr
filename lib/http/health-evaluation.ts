/** A run stuck without finishedAt for this long is treated as failed, not running. */
export const STUCK_RUN_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2h
/**
 * Freshness thresholds are tuned to the existing daily 04:00 KST cron cycle
 * plus slack for a missed day; these are adjustable initial proposals, not
 * an agreed operational SLA.
 */
export const SOURCE_WARNING_THRESHOLD_MS = 36 * 60 * 60 * 1000; // 36h
export const SOURCE_FAILURE_THRESHOLD_MS = 72 * 60 * 60 * 1000; // 72h

export type LastRunState = "none" | "running" | "success" | "partial" | "failed";

export interface LatestSyncRow {
  ranAt: Date;
  finishedAt: Date | null;
  insertedCount: number;
  updatedCount: number;
  errorCount: number;
}

export interface HealthEvaluation {
  status: "healthy" | "degraded" | "failed";
  httpStatus: 200 | 503;
  lastRunState: LastRunState;
  lastCompletedSuccessAt: string | null;
  sourceAgeMs: number | null;
  backlog: boolean;
}

/**
 * Pure decision logic, separated from DB/IO so it can be unit tested
 * without mocking the database module. "DB reachable" (this function was
 * called at all) and "sync data is fresh" (the fields below) are distinct
 * facts: a database full of old rows with no recent sync history must not
 * be reported healthy just because festivalCount > 0.
 */
export function evaluateHealth(
  festivalCount: number,
  latestSync: LatestSyncRow | undefined,
  now: number,
): HealthEvaluation {
  let lastRunState: LastRunState = "none";
  let lastCompletedSuccessAt: string | null = null;
  let sourceAgeMs: number | null = null;

  if (latestSync) {
    if (!latestSync.finishedAt) {
      // A run started but never finished. If it started long enough ago
      // that it should have completed, treat it as stuck rather than
      // silently "in progress" forever.
      const runningForMs = now - latestSync.ranAt.getTime();
      lastRunState = runningForMs > STUCK_RUN_THRESHOLD_MS ? "failed" : "running";
    } else if (latestSync.errorCount > 0) {
      lastRunState =
        latestSync.insertedCount + latestSync.updatedCount > 0
          ? "partial"
          : "failed";
    } else {
      lastRunState = "success";
    }

    if (lastRunState === "success" || lastRunState === "partial") {
      const finishedAt = latestSync.finishedAt;
      if (finishedAt) {
        lastCompletedSuccessAt = finishedAt.toISOString();
        sourceAgeMs = now - finishedAt.getTime();
      }
    }
  }

  const backlog = festivalCount === 0;
  const staleFailure =
    sourceAgeMs !== null && sourceAgeMs > SOURCE_FAILURE_THRESHOLD_MS;
  const staleWarning =
    sourceAgeMs !== null && sourceAgeMs > SOURCE_WARNING_THRESHOLD_MS;

  // No sync history at all, or a hard failure with no successful data
  // yet, or success data old enough to be considered stale, are all
  // "not healthy" even though the DB connection itself works.
  const failed =
    lastRunState === "none" ||
    (lastRunState === "failed" && lastCompletedSuccessAt === null) ||
    backlog ||
    staleFailure;
  const degraded = !failed && (lastRunState === "partial" || staleWarning);

  return {
    status: failed ? "failed" : degraded ? "degraded" : "healthy",
    httpStatus: failed ? 503 : 200,
    lastRunState,
    lastCompletedSuccessAt,
    sourceAgeMs,
    backlog,
  };
}
