// SELECT-only capture of the public festivals table. Raw data stays Git-ignored.
import { createClient } from "@libsql/client";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import "./load-env.mjs";

const output = path.resolve(".goal-harness/private/production-20260920.json");
const limit = 10000;
let client;
try {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url || !/^(libsql|https):\/\//.test(url))
    throw new Error("REMOTE_CONFIG_UNAVAILABLE");
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  // One bounded read; do not import the app DB module or any collector.
  const result = await client.execute(
    `SELECT * FROM festivals ORDER BY content_id LIMIT ${limit + 1}`,
  );
  if (result.rows.length > limit) throw new Error("SNAPSHOT_LIMIT_EXCEEDED");
  const rows = result.rows.map((row) =>
    Object.fromEntries(result.columns.map((column) => [column, row[column]])),
  );
  const data = JSON.stringify({
    observedAt: new Date().toISOString(),
    table: "festivals",
    columns: result.columns,
    rows,
  });
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, data, { flag: "wx" });
  console.log(
    JSON.stringify({
      result: "READ_ONLY_SNAPSHOT",
      rows: rows.length,
      sha256: createHash("sha256").update(data).digest("hex"),
      output: ".goal-harness/private/production-20260920.json",
    }),
  );
} catch (error) {
  // Connection errors can include credentials/URLs. Print only allowlisted categories.
  const known = ["REMOTE_CONFIG_UNAVAILABLE", "SNAPSHOT_LIMIT_EXCEEDED"];
  console.error(
    known.includes(error.message)
      ? error.message
      : error.code === "EEXIST"
        ? "SNAPSHOT_EXISTS_PRESERVED"
        : "SNAPSHOT_READ_FAILED_NO_DETAILS",
  );
  process.exitCode = 1;
} finally {
  client?.close();
}
