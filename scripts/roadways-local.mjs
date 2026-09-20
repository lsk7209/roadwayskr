// Isolated local checks: always overrides production DB/ad/analytics settings.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
const mode = process.argv[2];
const dataset = process.argv[3] ?? "fixture";
if (!["fixture", "snapshot", "repaired"].includes(dataset))
  throw new Error("Use fixture, snapshot or repaired dataset");
if (!["build", "start", "dev"].includes(mode))
  throw new Error("Use build, start or dev");
const database = path
  .resolve(
    dataset === "repaired"
      ? ".goal-harness/private/repaired.db"
      : dataset === "snapshot"
      ? ".goal-harness/private/parity.db"
      : ".goal-harness/test-data.db",
  )
  .replaceAll("\\", "/");
if (!existsSync(database))
  throw new Error("Create the selected isolated dataset before running checks");
const env = {
  ...process.env,
  TURSO_DATABASE_URL: `file:${database}`,
  TURSO_AUTH_TOKEN: "",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-0000000000000000",
  NEXT_PUBLIC_ADSENSE_PUB_ID: "",
  TOUR_API_SERVICE_KEY: "",
  INDEXNOW_KEY: "",
  CRON_SECRET: "",
  SITE_URL: "https://roadways.kr",
  NEXT_TELEMETRY_DISABLED: "1",
};
const args = [
  "node_modules/next/dist/bin/next",
  mode,
  ...(mode === "build" ? [] : ["--hostname", "127.0.0.1", "--port", "3020"]),
];
const child = spawn(process.execPath, args, {
  env,
  stdio: "inherit",
  windowsHide: true,
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
