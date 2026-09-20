import type { Festival, NewFestival } from "../../db/schema";
import { extractTourIntroProgram } from "../content";

/** Collector writes cannot overwrite editorial decisions or existing URLs. */
export function prepareFestivalUpdate(
  existing: Festival,
  incoming: NewFestival,
  now = new Date(),
) {
  const row: NewFestival = {
    ...incoming,
    slug: existing.slug,
    curatorNote: existing.curatorNote,
    isIndexable: existing.isIndexable,
    status: existing.status === "cancelled" ? "cancelled" : incoming.status,
  };
  const ignored = new Set(["syncedAt", "rawJson", "createdAt", "updatedAt"]);
  const changed =
    (Object.keys(row) as (keyof NewFestival)[]).some(
      (key) =>
        !ignored.has(key) &&
        row[key] !== undefined &&
        row[key] !== existing[key],
    ) ||
    (row.rawJson !== undefined &&
      extractTourIntroProgram(row.rawJson) !==
        extractTourIntroProgram(existing.rawJson));
  return {
    changed,
    row: { ...row, updatedAt: changed ? now : existing.updatedAt },
  };
}
