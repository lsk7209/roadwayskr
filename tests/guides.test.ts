import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  GUIDES,
  findGuideBySlug,
  guideInternalLinks,
  guideTextLength,
} from "../lib/guides";
import { THEMES } from "../lib/themes";

const MIN_GUIDE_CHARS = 1_500;

// 페르소나 must_avoid 목록 중 상투 표현
const BANNED_PHRASES = [
  "꼭 가보세요",
  "강추",
  "완전 대박",
  "이거 모르면 손해",
  "바쁜 현대인",
  "잊지 못할 추억",
  "단연 최고",
  "안성맞춤",
  "지친 일상",
  "특별한 추억",
  "알아보겠습니다",
  "도움이 되셨기를",
];

const STATIC_ROUTES = new Set([
  "/",
  "/weekend",
  "/regions",
  "/themes",
  "/guides",
  "/blog",
  "/about",
  "/about/curator",
  "/contact",
  "/privacy",
  "/terms",
  "/data-policy",
]);
const THEME_SLUGS = new Set(THEMES.map((t) => t.slug));

test("guide slugs are unique and every guide meets the length floor", () => {
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, GUIDES.length);
  for (const guide of GUIDES) {
    const length = guideTextLength(guide);
    assert.ok(
      length >= MIN_GUIDE_CHARS,
      `${guide.slug} body is ${length} chars (< ${MIN_GUIDE_CHARS})`,
    );
  }
});

test("guide metadata stays within search snippet limits", () => {
  for (const guide of GUIDES) {
    assert.ok(guide.title.length <= 40, `${guide.slug} title too long`);
    assert.ok(
      guide.description.length >= 50 && guide.description.length <= 160,
      `${guide.slug} description length ${guide.description.length}`,
    );
    assert.match(guide.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(guide.updatedAt >= guide.publishedAt);
  }
});

test("guides avoid persona-banned cliché phrases", () => {
  for (const guide of GUIDES) {
    const text = JSON.stringify(guide);
    for (const phrase of BANNED_PHRASES) {
      assert.ok(!text.includes(phrase), `${guide.slug} uses "${phrase}"`);
    }
  }
});

test("every internal link in guides resolves to a real route", () => {
  for (const guide of GUIDES) {
    for (const href of guideInternalLinks(guide)) {
      if (STATIC_ROUTES.has(href)) continue;
      const guideMatch = href.match(/^\/guides\/([^/]+)$/);
      if (guideMatch) {
        assert.ok(findGuideBySlug(guideMatch[1]), `${guide.slug} → ${href}`);
        continue;
      }
      const themeMatch = href.match(/^\/themes\/([^/]+)$/);
      if (themeMatch) {
        assert.ok(THEME_SLUGS.has(themeMatch[1]), `${guide.slug} → ${href}`);
        continue;
      }
      assert.fail(`${guide.slug} links to unknown route ${href}`);
    }
  }
});

test("related guide references exist and do not point to themselves", () => {
  for (const guide of GUIDES) {
    for (const slug of guide.related) {
      assert.ok(findGuideBySlug(slug), `${guide.slug} related ${slug}`);
      assert.notEqual(slug, guide.slug);
    }
  }
});

test("static routes referenced by guides exist in the app directory", () => {
  for (const route of STATIC_ROUTES) {
    if (route === "/") continue;
    assert.ok(
      existsSync(join(process.cwd(), "app", route, "page.tsx")),
      `missing app${route}/page.tsx`,
    );
  }
});
