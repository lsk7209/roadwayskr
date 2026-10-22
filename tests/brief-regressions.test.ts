import assert from "node:assert/strict";
import { test } from "node:test";
import { extractThemes } from "../lib/tourapi/normalizer";
import { resolveAreaCodeFromAddress } from "../lib/regions";
import { eventSourceNote } from "../lib/event-source-notes";
import { isLongRunning, scheduleOnDate } from "../lib/festival-dates";
import { pageCanonical, shareMetadata } from "../lib/page-meta";

const none = { overview: null, eventPlace: null, program: null };

test("T04 flower theme needs a title cue or repeated body mentions", () => {
  assert.deepEqual(extractThemes({ title: "봄꽃 축제", ...none }), ["꽃축제"]);
  // 드론쇼/역사탐방/커피 행사의 곁가지 "꽃" 한 단어
  for (const title of ["파주 드론쇼", "고궁 역사탐방", "원두 커피 페스티벌"]) {
    assert.ok(
      !extractThemes({
        title,
        overview: "행사장 주변 꽃길을 걸으며 즐기는 프로그램입니다.",
        eventPlace: null,
        program: null,
      }).includes("꽃축제"),
      title,
    );
  }
  // 본문에서 꽃이 반복되는 복합 행사는 포함
  assert.ok(
    extractThemes({
      title: "가을 정원 페스티벌",
      overview: "국화 꽃 전시, 장미 꽃길, 꽃 체험, 튤립 정원을 운영합니다.",
      eventPlace: null,
      program: null,
    }).includes("꽃축제"),
  );
  // 불꽃·눈꽃은 식물 꽃이 아니다
  assert.ok(
    !extractThemes({
      title: "불꽃 눈꽃 야간쇼",
      overview: "불꽃 불꽃 불꽃 눈꽃",
      eventPlace: null,
      program: null,
    }).includes("꽃축제"),
  );
});

test("T05 area aliases map only confirmed addresses", () => {
  assert.equal(resolveAreaCodeFromAddress("전남광주통합특별시 여수시 중앙동"), "38");
  assert.equal(resolveAreaCodeFromAddress("전남광주통합특별시 고흥군 고흥읍"), "38");
  assert.equal(resolveAreaCodeFromAddress("전남광주통합특별시 북구 용봉동"), "5");
  assert.equal(resolveAreaCodeFromAddress("전남광주통합특별시"), null);
  assert.equal(resolveAreaCodeFromAddress("전북특별자치도 전주시"), "37");
  assert.equal(resolveAreaCodeFromAddress("알 수 없는 주소"), null);
  assert.equal(resolveAreaCodeFromAddress(null), null);
});

test("T07/T08 Unjeong uses the 2026 8th official notice and one-day occurrence", () => {
  const note = eventSourceNote({
    contentId: 2789700,
    startDate: "2026-10-31",
    endDate: "2026-12-31",
  });
  assert.ok(note);
  assert.ok(note.sourceUrl.includes("no=430"));
  assert.ok(!note.sourceUrl.includes("no=182"));
  assert.deepEqual(note.officialOccurrence, {
    startDate: "2026-10-31",
    endDate: "2026-10-31",
  });
  // 다른 기간(다음 해 재사용 ID)에는 적용되지 않는다.
  assert.equal(
    eventSourceNote({
      contentId: 2789700,
      startDate: "2027-10-30",
      endDate: "2027-12-31",
    }),
    undefined,
  );
  // 11월 방문자에게 운영 일정 없음
  assert.equal(
    scheduleOnDate(
      { ...note.officialOccurrence!, recurrence: undefined },
      "2026-11-14",
    ),
    "NO_SCHEDULE_ON_DATE",
  );
});

test("T06 long-running detection and T02/T10 canonical + share metadata", () => {
  assert.equal(isLongRunning("2026-01-01", "2026-12-31"), true);
  assert.equal(isLongRunning("2026-10-31", "2026-11-02"), false);
  assert.equal(isLongRunning(null, "2026-11-02"), false);
  assert.equal(pageCanonical("/themes/꽃축제", 1), "https://roadways.kr/themes/꽃축제");
  assert.equal(
    pageCanonical("/themes/꽃축제", 2),
    "https://roadways.kr/themes/꽃축제?page=2",
  );
  const m = shareMetadata({ title: "t", description: "d", url: "https://roadways.kr/x" });
  assert.equal((m.openGraph as { url: string }).url, "https://roadways.kr/x");
  assert.equal((m.openGraph as { siteName: string }).siteName, "여행고고");
});
