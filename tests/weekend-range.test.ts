import assert from "node:assert/strict";
import { test } from "node:test";
import { getWeekendRange } from "../lib/current-festivals";

test("uses the Asia/Seoul calendar day, not the UTC calendar day, near midnight KST", () => {
  // 2026-09-12 03:00 KST (Saturday) == 2026-09-11 18:00 UTC (still Friday in UTC).
  // A UTC-day-based calculation would misread this as Friday and push the
  // weekend out by one day; the Seoul-aware calculation must land on today.
  const { satIso, sunIso } = getWeekendRange(new Date("2026-09-11T18:00:00Z"));
  assert.equal(satIso, "2026-09-12");
  assert.equal(sunIso, "2026-09-13");
});

test("mid-week instants resolve to the upcoming Saturday/Sunday", () => {
  // 2026-09-09 is a Wednesday in Seoul.
  const { satIso, sunIso } = getWeekendRange(new Date("2026-09-09T04:00:00Z"));
  assert.equal(satIso, "2026-09-12");
  assert.equal(sunIso, "2026-09-13");
});

test("Sunday instants roll forward to next weekend, matching prior behavior", () => {
  // 2026-09-13 is a Sunday in Seoul.
  const { satIso, sunIso } = getWeekendRange(new Date("2026-09-13T04:00:00Z"));
  assert.equal(satIso, "2026-09-19");
  assert.equal(sunIso, "2026-09-20");
});

test("Saturday itself resolves to today/tomorrow", () => {
  const { satIso, sunIso } = getWeekendRange(new Date("2026-09-12T04:00:00Z"));
  assert.equal(satIso, "2026-09-12");
  assert.equal(sunIso, "2026-09-13");
});
