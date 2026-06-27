import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REQUIRED_ENV = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "TOUR_API_SERVICE_KEY",
  "SITE_URL",
] as const;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return healthResponse({ error: "unauthorized" }, 401);
  }

  const startedAt = Date.now();
  const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    return healthResponse(
      {
        status: "fail",
        reason: "missing_env",
        missingEnv,
        latencyMs: Date.now() - startedAt,
      },
      503,
    );
  }

  try {
    const { db, festivals, syncRuns } = await import("@/db");
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(festivals);
    const [latestSync] = await db
      .select({
        id: syncRuns.id,
        mode: syncRuns.mode,
        ranAt: syncRuns.ranAt,
        finishedAt: syncRuns.finishedAt,
        insertedCount: syncRuns.insertedCount,
        updatedCount: syncRuns.updatedCount,
        errorCount: syncRuns.errorCount,
      })
      .from(syncRuns)
      .orderBy(desc(syncRuns.ranAt))
      .limit(1);

    const festivalCount = Number(countRow?.count ?? 0);
    const ok = festivalCount > 0 && (!latestSync || latestSync.errorCount === 0);

    return healthResponse(
      {
        status: ok ? "ok" : "fail",
        festivalCount,
        latestSync: latestSync
          ? {
              ...latestSync,
              ranAt: latestSync.ranAt.toISOString(),
              finishedAt: latestSync.finishedAt?.toISOString() ?? null,
            }
          : null,
        latencyMs: Date.now() - startedAt,
      },
      ok ? 200 : 503,
    );
  } catch (error) {
    return healthResponse(
      {
        status: "fail",
        reason: error instanceof Error ? error.message : "unknown_error",
        latencyMs: Date.now() - startedAt,
      },
      503,
    );
  }
}

function healthResponse(body: object, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
