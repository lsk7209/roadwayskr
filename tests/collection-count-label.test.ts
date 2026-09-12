import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCollectionCountLabel } from "../lib/collection-count-label";

test("shows plain count when total fits within the displayed items", () => {
  assert.equal(formatCollectionCountLabel(5, 5), "5건");
  assert.equal(formatCollectionCountLabel(0, 0), "0건");
});

test("discloses truncation when total exceeds the LIMIT-ed displayed count", () => {
  // OBS-04: 실제 135건인데 상세 페이지가 LIMIT 80이라 80건만 보이던 문제
  assert.equal(
    formatCollectionCountLabel(135, 80),
    "총 135건 중 최신 80건을 표시합니다",
  );
});
