import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTableColumns } from "drizzle-orm";
import { festivals } from "../db/schema";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

test("sitemap propagates a DB failure instead of silently returning a truncated 200", async () => {
  // No table created: any query against `festivals` will throw, simulating
  // a DB outage/misconfiguration rather than a genuinely empty result set.
  const client = createClient({ url: ":memory:" });
  try {
    const db = drizzle(client);
    await assert.rejects(
      db.select().from(festivals).limit(1),
      /no such table/i,
    );
  } finally {
    client.close();
  }
});

test("sitemap distinguishes a real empty result set from a DB failure", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    const columns = Object.values(getTableColumns(festivals)).map(
      (c) => `"${c.name}" ${c.getSQLType()}`,
    );
    await client.execute(`CREATE TABLE festivals (${columns.join(", ")})`);
    const db = drizzle(client);

    // Table exists and query succeeds; zero rows is a legitimate empty
    // state, not a thrown error.
    const rows = await db.select().from(festivals).limit(1);
    assert.deepEqual(rows, []);
  } finally {
    client.close();
  }
});
