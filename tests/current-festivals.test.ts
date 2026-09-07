import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, gte, lte } from "drizzle-orm";
import { festivals } from "../db/schema";
import { currentFestivalCondition } from "../lib/current-festivals";

test("homepage latest query uses current discovery before ordering and limiting", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const query = source.slice(source.indexOf("async function getLatestEvents()"), source.indexOf("export default async function Home()"));
  assert.match(query, /\.where\(currentFestivalCondition\(\)\)/);
  assert.match(query, /\.orderBy\(desc\(festivals.updatedAt\)\)/);
  assert.match(query, /\.limit\(8\)/);
});

test("both weekend entry points retain overlap and apply current discovery", async () => {
  for (const path of ["../app/page.tsx", "../app/weekend/page.tsx"]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /lte\(festivals.startDate,/);
    assert.match(source, /gte\(festivals.endDate,[\s\S]*?currentFestivalCondition\(\)/);
  }
});

test("current discovery excludes expired, cancelled, missing-date and hidden rows", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.execute("CREATE TABLE festivals (content_id INTEGER, is_indexable INTEGER, status TEXT, end_date TEXT)");
    const rows = [
      [1, 1, "ongoing", "2026-09-07"],
      [2, 1, "upcoming", "2026-10-01"],
      [3, 1, "ongoing", "2025-12-31"],
      [4, 1, "cancelled", "2026-10-01"],
      [5, 1, "ended", "2026-10-01"],
      [6, 1, "upcoming", null],
      [7, 0, "ongoing", "2026-10-01"],
    ];
    for (const args of rows) await client.execute({ sql: "INSERT INTO festivals VALUES (?, ?, ?, ?)", args });
    const db = drizzle(client);
    const result = await db.select({ id: festivals.contentId }).from(festivals)
      .where(currentFestivalCondition(new Date("2026-09-07T14:59:59Z")));
    assert.deepEqual(result.map(row => row.id), [1, 2]);
    const afterMidnight = await db.select({ id: festivals.contentId }).from(festivals)
      .where(currentFestivalCondition(new Date("2026-09-07T15:00:00Z")));
    assert.deepEqual(afterMidnight.map(row => row.id), [2]);
  } finally {
    client.close();
  }
});

test("date-overlapping cancelled events cannot enter weekend discovery", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.execute("CREATE TABLE festivals (content_id INTEGER, is_indexable INTEGER, status TEXT, start_date TEXT, end_date TEXT)");
    for (const [id, status] of [[1, "ongoing"], [2, "cancelled"], [3, "ended"]]) {
      await client.execute({ sql: "INSERT INTO festivals VALUES (?, 1, ?, '2026-09-01', '2026-09-30')", args: [id, status] });
    }
    const result = await drizzle(client).select({ id: festivals.contentId }).from(festivals).where(and(
      lte(festivals.startDate, "2026-09-13"),
      gte(festivals.endDate, "2026-09-12"),
      currentFestivalCondition(new Date("2026-09-07T10:00:00Z")),
    ));
    assert.deepEqual(result.map(row => row.id), [1]);
  } finally { client.close(); }
});
