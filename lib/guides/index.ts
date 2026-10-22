import type { Guide, GuideBlock } from "./types";
import { guide as festivalCancellationCheck } from "./articles/festival-cancellation-check";
import { guide as kidsFestivalChecklist } from "./articles/kids-festival-checklist";
import { guide as festivalPublicTransport } from "./articles/festival-public-transport";
import { guide as festivalParkingTips } from "./articles/festival-parking-tips";
import { guide as freeVsPaidFestivals } from "./articles/free-vs-paid-festivals";
import { guide as rainyDayFestival } from "./articles/rainy-day-festival";
import { guide as seasonalFestivalCalendar } from "./articles/seasonal-festival-calendar";
import { guide as weekendFestivalPlanning } from "./articles/weekend-festival-planning";
import { guide as nightFestivalTips } from "./articles/night-festival-tips";
import { guide as howToReadFestivalInfo } from "./articles/how-to-read-festival-info";
import { guide as festivalFoodBudget } from "./articles/festival-food-budget";
import { guide as elderlyParentsFestival } from "./articles/elderly-parents-festival";

export type { Guide, GuideBlock, GuideFaq } from "./types";

/** 목록 노출 순서. */
export const GUIDES: Guide[] = [
  weekendFestivalPlanning,
  festivalCancellationCheck,
  kidsFestivalChecklist,
  festivalPublicTransport,
  festivalParkingTips,
  freeVsPaidFestivals,
  rainyDayFestival,
  nightFestivalTips,
  seasonalFestivalCalendar,
  festivalFoodBudget,
  elderlyParentsFestival,
  howToReadFestivalInfo,
];

const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));

export const findGuideBySlug = (slug: string) => BY_SLUG.get(slug);

export function relatedGuides(guide: Guide): Guide[] {
  return guide.related
    .map((slug) => BY_SLUG.get(slug))
    .filter((g): g is Guide => Boolean(g));
}

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function blockText(block: GuideBlock): string {
  if ("items" in block) return block.items.join(" ");
  if (block.type === "tip") return `${block.title} ${block.text}`;
  return block.text;
}

/** 본문 글자 수(공백·링크 문법 제외). 품질 하한 테스트용. */
export function guideTextLength(guide: Guide): number {
  return guide.body
    .map(blockText)
    .join("")
    .replace(LINK_PATTERN, "$1")
    .replace(/\s+/g, "").length;
}

/** 본문에 쓰인 내부 링크 경로. 깨진 링크 테스트용. */
export function guideInternalLinks(guide: Guide): string[] {
  const text = guide.body.map(blockText).join(" ");
  return [...text.matchAll(LINK_PATTERN)].map((m) => m[2]);
}
