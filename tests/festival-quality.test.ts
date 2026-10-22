import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_SUBSTANTIVE_CHARS,
  hasSubstantiveContent,
  substantiveLength,
} from "../lib/festival-quality";

test("short overview without program is not substantive", () => {
  const festival = { overview: "짧은 소개입니다.<br>", rawJson: null };
  assert.equal(hasSubstantiveContent(festival), false);
});

test("overview and program text together can pass the gate", () => {
  const half = "가".repeat(MIN_SUBSTANTIVE_CHARS / 2);
  const festival = {
    overview: `<p>${half}</p>`,
    rawJson: JSON.stringify({ intro: { program: half } }),
  };
  assert.equal(substantiveLength(festival), MIN_SUBSTANTIVE_CHARS);
  assert.equal(hasSubstantiveContent(festival), true);
});

test("markup and whitespace do not count toward length", () => {
  const festival = {
    overview: `<br>   &nbsp;  <strong>${"나".repeat(10)}</strong>`,
    rawJson: "not json",
  };
  assert.equal(substantiveLength(festival), 10);
});
