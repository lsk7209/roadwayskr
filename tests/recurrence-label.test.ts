import assert from "node:assert/strict";
import { test } from "node:test";
import { recurrenceLabel } from "../lib/festival-dates";

test("recurrenceLabel builds phrasing from recurrence.mode/isoWeekdays, not a Fri/Sat assumption", () => {
  assert.equal(
    recurrenceLabel({ mode: "iso_weekdays", isoWeekdays: [5, 6] }),
    "금·토 운영 · 당일 변경 공지 확인",
  );
  assert.equal(
    recurrenceLabel({ mode: "iso_weekdays", isoWeekdays: [1, 3] }),
    "월·수 운영 · 당일 변경 공지 확인",
  );
  assert.equal(
    recurrenceLabel({ mode: "daily", isoWeekdays: [] }),
    "매일 운영 · 당일 변경 공지 확인",
  );
  assert.equal(
    recurrenceLabel({ mode: "unknown", isoWeekdays: [] }),
    "운영일 확인 필요 · 당일 변경 공지 확인",
  );
  assert.equal(recurrenceLabel(undefined), "개별 운영일·시간 확인 필요");
  // Deduplicates and sorts regardless of input order.
  assert.equal(
    recurrenceLabel({ mode: "iso_weekdays", isoWeekdays: [6, 5, 5] }),
    "금·토 운영 · 당일 변경 공지 확인",
  );
  // Out-of-range weekday values are dropped, not misrendered.
  assert.equal(
    recurrenceLabel({ mode: "iso_weekdays", isoWeekdays: [0, 8] }),
    "운영일 확인 필요 · 당일 변경 공지 확인",
  );
});
