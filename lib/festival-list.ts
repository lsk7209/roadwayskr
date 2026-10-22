import {
  and,
  eq,
  gte,
  lte,
  ne,
  notInArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { festivals } from "../db/schema";
import { currentFestivalCondition } from "./current-festivals";
import { AREAS, findAreaByCode } from "./regions";
import { LONG_RUNNING_DAYS, validDate } from "./festival-dates";

export type SearchValues = Record<string, string | string[] | undefined>;
export type DateRange = { from: string; to: string };
export type ListFilter = {
  range?: DateRange;
  areaCode?: string;
  now?: Date;
  page?: number;
  pageSize?: number;
  /**
   * Skips the redundant count(*) query when the caller already computed
   * the total for this exact condition (e.g. via festivalGroups()).
   */
  knownTotal?: number;
};

/** Short-run events first so months-long programs do not crowd out the weekend picks. */
const longRunningRank = sql`case when julianday(${festivals.endDate}) - julianday(${festivals.startDate}) > ${LONG_RUNNING_DAYS} then 1 else 0 end`;

export function parseListSearch(search: SearchValues) {
  const { from, to, page } = search;
  const start = typeof from === "string" ? validDate(from) : null;
  const end = typeof to === "string" ? validDate(to) : null;
  if (
    (from !== undefined || to !== undefined) &&
    (!start ||
      !end ||
      start > end ||
      Date.parse(end) - Date.parse(start) > 366 * 86400000)
  )
    return null;
  if (
    page !== undefined &&
    (typeof page !== "string" || !/^[1-9]\d{0,5}$/.test(page))
  )
    return null;
  return {
    range: start && end ? { from: start, to: end } : undefined,
    page: Number(page ?? 1),
  };
}

export function listHref(path: string, range?: DateRange, page = 1) {
  const q = new URLSearchParams();
  if (range) {
    q.set("from", range.from);
    q.set("to", range.to);
  }
  if (page > 1) q.set("page", String(page));
  return `${path}${q.size ? `?${q}` : ""}`;
}

export function festivalListCondition(filter: ListFilter) {
  const range = filter.range;
  return and(
    range
      ? and(
          eq(festivals.isIndexable, true),
          ne(festivals.status, "cancelled"),
          lte(festivals.startDate, range.to),
          gte(festivals.endDate, range.from),
        )
      : currentFestivalCondition(filter.now),
    filter.areaCode === "unknown"
      ? or(
          isNull(festivals.areaCode),
          notInArray(
            festivals.areaCode,
            AREAS.map((a) => a.code),
          ),
        )
      : filter.areaCode
        ? eq(festivals.areaCode, filter.areaCode)
        : undefined,
  );
}

export async function festivalPage<T extends Record<string, unknown>>(
  db: LibSQLDatabase<T>,
  filter: ListFilter,
) {
  const condition = festivalListCondition(filter);
  const size = filter.pageSize ?? 24;
  const page = filter.page ?? 1;

  // When the caller already knows the total (e.g. from a prior
  // festivalGroups() call for the same condition), skip the redundant
  // count(*) query. This turns the weekend page's per-area fan-out from
  // 1 (groups) + 2*G (items + count per area) into 1 + G queries.
  if (filter.knownTotal !== undefined) {
    const items = await db
      .select()
      .from(festivals)
      .where(condition)
      .orderBy(longRunningRank, festivals.startDate, festivals.contentId)
      .limit(size)
      .offset((page - 1) * size);
    const total = filter.knownTotal;
    return { items, total, pages: Math.max(1, Math.ceil(total / size)), page };
  }

  const [items, counts] = await Promise.all([
    db
      .select()
      .from(festivals)
      .where(condition)
      .orderBy(longRunningRank, festivals.startDate, festivals.contentId)
      .limit(size)
      .offset((page - 1) * size),
    db
      .select({ count: sql<number>`count(*)` })
      .from(festivals)
      .where(condition),
  ]);
  const total = Number(counts[0]?.count ?? 0);
  return { items, total, pages: Math.max(1, Math.ceil(total / size)), page };
}

export async function festivalGroups<T extends Record<string, unknown>>(
  db: LibSQLDatabase<T>,
  filter: ListFilter,
) {
  const rows = await db
    .select({ code: festivals.areaCode, count: sql<number>`count(*)` })
    .from(festivals)
    .where(festivalListCondition(filter))
    .groupBy(festivals.areaCode);
  const groups = new Map<string, number>();
  for (const row of rows) {
    const code = row.code && findAreaByCode(row.code) ? row.code : "unknown";
    groups.set(code, (groups.get(code) ?? 0) + Number(row.count));
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, count]) => ({ code, count }));
}
