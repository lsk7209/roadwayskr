import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTableColumns } from "drizzle-orm";
import { festivals, type Festival } from "../db/schema";
import {
  festivalGroups,
  festivalPage,
  parseListSearch,
  listHref,
} from "../lib/festival-list";
import {
  formatPeriod,
  scheduleOnDate,
  seoulDate,
  withinTimeWindow,
  periodState,
  monthCategory,
  relativeMonth,
} from "../lib/festival-dates";
import { festivalPeriod } from "../lib/festival-facts";
import { eventSourceNote } from "../lib/event-source-notes";
import { prepareFestivalUpdate } from "../lib/tourapi/merge";
import { trackAction } from "../lib/analytics";

const fixture = JSON.parse(
  readFileSync(
    new URL("../ddd/06_SYNTHETIC_TEST_FIXTURES.json", import.meta.url),
    "utf8",
  ),
);

test("T03 malformed, partial and raw fallback periods stay honest", () => {
  assert.equal(formatPeriod(null, ""), "일정 확인 중");
  assert.equal(formatPeriod("2026-02-30", "bad"), "일정 확인 중");
  assert.equal(formatPeriod("2026-09-20", "2026-09-19"), "일정 확인 중");
  assert.match(formatPeriod("2026-09-19", null), /종료일 확인 중/);
  assert.deepEqual(
    festivalPeriod({
      startDate: "",
      endDate: null,
      rawJson: JSON.stringify({
        intro: { eventstartdate: "20260919", eventenddate: "20260920" },
      }),
    }),
    { startDate: "2026-09-19", endDate: "2026-09-20" },
  );
  assert.equal(
    periodState(
      "2026-09-19",
      "2026-09-19",
      "ongoing",
      new Date("2026-09-19T15:00:00Z"),
    ),
    "ended",
  );
});

test("T07/T08/T09 all 13 supplied calendar cases, cancellation and timed boundaries", () => {
  for (const c of fixture.calendar_cases) {
    const e = fixture.calendar_events.find(
      (item: { id: string }) => item.id === c.event_id,
    );
    const date = seoulDate(new Date(c.at_utc));
    assert.equal(date, c.expected_kst_date, c.case_id);
    assert.equal(
      scheduleOnDate(
        {
          startDate: e.start_date,
          endDate: e.end_date,
          recurrence: {
            mode: e.recurrence.mode,
            isoWeekdays: e.recurrence.iso_weekdays,
          },
          cancelledDates: e.cancelled_dates,
        },
        date,
      ),
      c.expected_schedule_state,
      c.case_id,
    );
  }
  for (const c of fixture.time_window_cases.cases) {
    assert.equal(
      withinTimeWindow(
        fixture.time_window_cases.starts_at,
        fixture.time_window_cases.ends_at,
        new Date(c.at_utc),
      ),
      c.expected_within_scheduled_time_window,
      c.case_id,
    );
  }
});

test("T04/T05 actual SQL filters before pagination, keeps Saturday on Sunday, sums unmapped rows", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    const columns = Object.values(getTableColumns(festivals)).map(
      (c) => `"${c.name}" ${c.getSQLType()}`,
    );
    await client.execute(`CREATE TABLE festivals (${columns.join(", ")})`);
    const db = drizzle(client);
    const regions: Record<string, string> = {
      서울: "1",
      경기도: "31",
      제주: "39",
    };
    for (const row of fixture.groups_fixture.items)
      await db
        .insert(festivals)
        .values({
          contentId: Number(row.id.slice(5)),
          title: row.id,
          slug: row.id,
          areaCode: regions[row.region] ?? "SYN-UNMAPPED",
          startDate: row.start_date,
          endDate: row.end_date,
          status: "ongoing",
          isIndexable: row.published,
        });
    const range = { from: "2026-09-19", to: "2026-09-20" };
    const groups = await festivalGroups(db, { range });
    assert.deepEqual(Object.fromEntries(groups.map((g) => [g.code, g.count])), {
      "1": 2,
      "31": 1,
      "39": 1,
      unknown: 1,
    });
    const ids: number[] = [];
    for (let page = 1; page <= 3; page++) {
      const result = await festivalPage(db, { range, pageSize: 2, page });
      assert.equal(result.total, 5);
      ids.push(...result.items.map((f) => f.contentId));
    }
    assert.deepEqual([...ids].sort(), [1, 2, 3, 4, 5]);
    assert.equal(new Set(ids).size, 5);
    const unknown = await festivalPage(db, { range, areaCode: "unknown" });
    assert.deepEqual(
      unknown.items.map((f) => f.contentId),
      [5],
    );
    await db
      .insert(festivals)
      .values(
        Array.from({ length: 70 }, (_, i) => ({
          contentId: i + 100,
          title: "synthetic",
          slug: `synthetic-${i}`,
          areaCode: "1",
          startDate: "2026-09-19",
          endDate: "2026-09-20",
          status: "ongoing",
          isIndexable: true,
        })),
      );
    assert.equal((await festivalPage(db, { range })).total, 75);
    assert.equal(
      (await festivalGroups(db, { range })).reduce((n, g) => n + g.count, 0),
      75,
    );
    // Past-month records remain available after their period ends.
    assert.equal(
      (await festivalPage(db, { range, now: new Date("2027-01-01T00:00:00Z") }))
        .total,
      75,
    );
  } finally {
    client.close();
  }
});

test("T06 selected absolute dates and page survive links; malformed filters never widen scope", () => {
  const range = { from: "2026-09-19", to: "2026-09-20" };
  const href = listHref("/regions/서울", range, 2);
  const params = Object.fromEntries(
    new URL(href, "https://roadways.kr").searchParams,
  );
  assert.deepEqual(parseListSearch(params), { range, page: 2 });
  assert.deepEqual(parseListSearch({ from: "20260919", to: "20260920" }), {
    range,
    page: 1,
  });
  for (const q of [
    { from: "2026-09-19" },
    { from: "2026-02-30", to: "2026-09-20" },
    { from: "2026-09-20", to: "2026-09-19" },
    { from: ["2026-09-19"], to: "2026-09-20" },
    { page: "NaN" },
  ])
    assert.equal(parseListSearch(q), null);
});

test("T11 same-content sync preserves lastmod, curator, indexing decision, cancellation and URL", () => {
  const existing = {
    contentId: 1,
    title: "A",
    slug: "old-url",
    curatorNote: "confirmed note",
    isIndexable: false,
    status: "cancelled",
    updatedAt: new Date("2026-09-01T00:00:00Z"),
  } as Festival;
  const incoming = {
    contentId: 1,
    title: "A",
    slug: "new-url",
    curatorNote: null,
    isIndexable: true,
    status: "ongoing",
    syncedAt: new Date(),
  };
  const noChange = prepareFestivalUpdate(existing, incoming);
  assert.equal(noChange.changed, false);
  assert.equal(noChange.row.updatedAt, existing.updatedAt);
  assert.equal(noChange.row.curatorNote, existing.curatorNote);
  assert.equal(noChange.row.isIndexable, false);
  assert.equal(noChange.row.slug, "old-url");
  assert.equal(noChange.row.status, "cancelled");
  assert.equal(
    prepareFestivalUpdate(existing, { ...incoming, title: "B" }).changed,
    true,
  );
  assert.equal(
    prepareFestivalUpdate(existing, {
      ...incoming,
      rawJson: JSON.stringify({ intro: { program: "New public program" } }),
    }).changed,
    true,
  );
  assert.equal(
    prepareFestivalUpdate(existing, {
      ...incoming,
      rawJson: JSON.stringify({ fetchedAt: "new transport metadata" }),
    }).changed,
    false,
  );
});

test("T09/T10 notes are source-period scoped and each program uses its own place", () => {
  const event = {
    contentId: 2809535,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  };
  const note = eventSourceNote(event)!;
  assert.notEqual(note.programs![0].address, note.programs![1].address);
  assert.equal(
    eventSourceNote({ ...event, startDate: "2027-01-01" }),
    undefined,
  );
  assert.equal(
    note.recurrence,
    undefined,
    "partial Bosingak cancellation must not classify all programs",
  );
});

test("T12 month categories are exclusive and navigation follows Seoul year rollover", () => {
  assert.equal(
    monthCategory("2026-09-01", "2026-09-20", "2026-09-01", "2026-09-30"),
    "이달 한정",
  );
  assert.equal(
    monthCategory("2026-09-01", "2026-10-20", "2026-09-01", "2026-09-30"),
    "이달 시작",
  );
  assert.equal(
    monthCategory("2026-08-01", "2026-09-20", "2026-09-01", "2026-09-30"),
    "이달 종료",
  );
  assert.equal(
    monthCategory("2026-08-01", "2026-10-20", "2026-09-01", "2026-09-30"),
    "여러 달에 걸친 행사",
  );
  assert.deepEqual(relativeMonth(0, new Date("2026-12-31T15:00:00Z")), {
    year: 2027,
    month: 1,
  });
});

test("T19 action sends one allowlisted event through existing tag and no local traffic", () => {
  const calls: unknown[][] = [];
  const target = {
    location: { hostname: "localhost" },
    gtag: (...args: unknown[]) => calls.push(args),
  };
  trackAction("map_open", 1, target as unknown as Window);
  assert.equal(calls.length, 0);
  target.location.hostname = "roadways.kr";
  trackAction("map_open", 1, target as unknown as Window);
  assert.deepEqual(calls, [
    ["event", "map_open", { content_id: 1, page_type: "festival" }],
  ]);
});
