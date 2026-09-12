import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeFestival } from "../lib/tourapi/normalizer";

function fakeBase(
  overrides: Partial<{ contentid: string; title: string }> = {},
) {
  return { contentid: "1", title: "행사", ...overrides };
}

test("single-syllable keyword false positives no longer classify unrelated events", () => {
  // 왕궁수문장 교대의식: 안내판 "배치" 문구 때문에 과일축제로 잘못 분류되던 사례
  const guardCeremony = normalizeFestival({
    base: fakeBase({ contentid: "1001", title: "왕궁수문장 교대의식" }),
    common: {
      contentid: "1001",
      overview: "관람객 동선 배치 안내와 사진 촬영 구역을 운영합니다.",
    },
  });
  assert.equal(guardCeremony.themesJson, null);

  // "눈치", "눈빛" 등 눈(目) 관련 단어가 눈(雪)축제로 잘못 분류되지 않아야 한다
  const etiquetteTalk = normalizeFestival({
    base: fakeBase({ contentid: "1002", title: "예절과 눈치 문화 강연" }),
  });
  assert.equal(etiquetteTalk.themesJson, null);

  // "맛"만으로 음식축제가 되지 않아야 한다
  const tasteTalk = normalizeFestival({
    base: fakeBase({ contentid: "1003", title: "인생의 멋과 맛 인문학 강연" }),
  });
  assert.equal(tasteTalk.themesJson, null);
});

test("genuine festivals in each fixed keyword category still classify correctly", () => {
  const apple = normalizeFestival({
    base: fakeBase({ contentid: "2001", title: "청송 사과축제" }),
  });
  assert.deepEqual(apple.themesJson && JSON.parse(apple.themesJson), [
    "과일축제",
  ]);

  const snowFlower = normalizeFestival({
    base: fakeBase({ contentid: "2002", title: "태백산 눈꽃축제" }),
  });
  // "눈꽃"은 눈축제이면서 꽃 이미지도 포함하므로 꽃축제가 함께 매칭되는 것은 정상이다.
  assert.ok(snowFlower.themesJson?.includes("눈축제"));

  const food = normalizeFestival({
    base: fakeBase({ contentid: "2003", title: "전주 먹거리 음식 축제" }),
  });
  assert.ok(food.themesJson?.includes("음식축제"));
});

test("themesCsv is comma-wrapped for LIKE search and null when no theme matches", () => {
  const apple = normalizeFestival({
    base: fakeBase({ contentid: "3001", title: "청송 사과축제" }),
  });
  assert.equal(apple.themesCsv, ",과일축제,");

  const none = normalizeFestival({
    base: fakeBase({ contentid: "3002", title: "지역 주민 화합 한마당" }),
  });
  assert.equal(none.themesCsv, null);
});
