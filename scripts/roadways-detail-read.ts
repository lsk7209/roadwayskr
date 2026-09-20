// Six bounded public-source GETs, no DB import or write. Produce review-only candidates.
import "./load-env.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { callTourApi, TourApiError } from "../lib/tourapi/client";
import { existsSync } from "node:fs";
import { normalizeFestival } from "../lib/tourapi/normalizer";
import type {
  FestivalCommonRaw,
  FestivalIntroRaw,
  FestivalRaw,
} from "../lib/tourapi/types";

async function main() {
  if (existsSync(".goal-harness/private/detail-candidates-20260920.json"))
    throw new Error("EXISTS");
  const snapshot = JSON.parse(
    await readFile(".goal-harness/private/production-20260920.json", "utf8"),
  );
  const candidates = [];
  for (const id of [229054, 3000221, 3337617]) {
    const row = snapshot.rows.find(
      (r: { content_id: number }) => r.content_id === id,
    );
    try {
      const base = JSON.parse(row.raw_json).base as FestivalRaw;
      const [commonResult, introResult] = await Promise.all([
        callTourApi<FestivalCommonRaw>(
          "detailCommon2",
          { contentId: id },
          { retries: 1, timeoutMs: 15000 },
        ),
        callTourApi<FestivalIntroRaw>(
          "detailIntro2",
          { contentId: id, contentTypeId: 15 },
          { retries: 1, timeoutMs: 15000 },
        ),
      ]);
      const common = commonResult.items[0],
        intro = introResult.items[0];
      if (
        !common ||
        !intro ||
        String(common.contentid) !== String(id) ||
        String(intro.contentid) !== String(id)
      )
        throw new Error("SOURCE_INCOMPLETE");
      const normalized = normalizeFestival({ base, common, intro });
      candidates.push({
        id,
        observedAt: new Date().toISOString(),
        status: "REVIEW_ONLY",
        original: row,
        normalized,
      });
      console.log(
        JSON.stringify({
          id,
          result: "SOURCE_READ",
          startDate: normalized.startDate,
          endDate: normalized.endDate,
          hasOverview: !!normalized.overview,
          hasPlace: !!normalized.eventPlace,
        }),
      );
    } catch (error) {
      candidates.push({ id, status: "SOURCE_READ_FAILED_NO_DETAILS" });
      console.log(
        JSON.stringify({
          id,
          result: "SOURCE_READ_FAILED_NO_DETAILS",
          apiCode: error instanceof TourApiError ? error.resultCode : undefined,
          httpStatus: error instanceof TourApiError ? error.status : undefined,
        }),
      );
    }
  }
  await writeFile(
    ".goal-harness/private/detail-candidates-20260920.json",
    JSON.stringify(candidates, null, 2),
    { flag: "wx" },
  );
}
main().catch(() => {
  console.error("CANDIDATE_PREPARATION_STOPPED_NO_DETAILS");
  process.exitCode = 1;
});
