import assert from "node:assert/strict";
import { test } from "node:test";
import { isRepeatedPage, isSuperseded } from "../lib/tourapi/paging";

test("T13 repeated page is detected, fresh page and empty page are not", () => {
  const got = [{ contentid: "1" }, { contentid: "2" }];
  assert.equal(isRepeatedPage(got, [{ contentid: "1" }, { contentid: "9" }]), true);
  assert.equal(isRepeatedPage(got, [{ contentid: "3" }]), false);
  assert.equal(isRepeatedPage(got, []), false);
});

test("T14 an older run is superseded by a newer run id", () => {
  assert.equal(isSuperseded(5, [6]), true);
  assert.equal(isSuperseded(5, []), false);
  assert.equal(isSuperseded(5, [4, 5]), false);
});
