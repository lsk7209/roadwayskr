import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeFestival } from "../lib/tourapi/normalizer";

test("blank list dates fall back to valid intro dates and reject invalid calendar input", () => {
  const base = {
    contentid: "9001",
    title: "가상 행사",
    eventstartdate: "",
    eventenddate: "",
  };
  const f = normalizeFestival({
    base,
    intro: { eventstartdate: "20260919", eventenddate: "20260920" },
  } as Parameters<typeof normalizeFestival>[0]);
  assert.equal(f.startDate, "2026-09-19");
  assert.equal(f.endDate, "2026-09-20");
  const invalid = normalizeFestival({
    base: { ...base, eventstartdate: "20260230", eventenddate: "20260231" },
  });
  assert.equal(invalid.startDate, null);
  assert.equal(invalid.endDate, null);
});

test("fee text is not operating time and mixed pricing is not globally free", () => {
  const f = normalizeFestival({
    base: { contentid: "9002", title: "가상 행사" },
    intro: { usetimefestival: "입장 무료, 체험 5000원" },
  } as Parameters<typeof normalizeFestival>[0]);
  assert.equal(f.useTime, null);
  assert.notEqual(f.feeIsFree, true);
});
