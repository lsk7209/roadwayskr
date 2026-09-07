import { and, eq, gte, inArray } from "drizzle-orm";
import { festivals } from "../db/schema";

/** Calendar dates in the Korean event directory must not follow server UTC. */
export function currentFestivalCondition(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return and(
    eq(festivals.isIndexable, true),
    inArray(festivals.status, ["ongoing", "upcoming"]),
    gte(festivals.endDate, today),
  );
}
