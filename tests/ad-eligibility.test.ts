import assert from "node:assert/strict";
import { test } from "node:test";
import { isAdExcludedPath } from "../lib/ad-eligibility";

test("excludes trust/policy/contact/admin screens from ads", () => {
  for (const path of [
    "/privacy",
    "/terms",
    "/contact",
    "/data-policy",
    "/admin",
    "/admin/sync",
    "/privacy/",
  ]) {
    assert.equal(isAdExcludedPath(path), true, path);
  }
});

test("keeps ads eligible on normal content pages", () => {
  for (const path of [
    "/",
    "/weekend",
    "/festivals/123/some-slug",
    "/themes/과일축제",
    "/regions/경기도",
    "/about",
    "/blog",
  ]) {
    assert.equal(isAdExcludedPath(path), false, path);
  }
});
