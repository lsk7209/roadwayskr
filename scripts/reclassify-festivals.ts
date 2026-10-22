/**
 * 기존 행사 행의 테마·지역을 현재 규칙으로 다시 계산한다.
 *   pnpm exec tsx --import ./scripts/load-env.mjs scripts/reclassify-festivals.ts          # dry-run(기본, DB 쓰기 없음)
 *   ... scripts/reclassify-festivals.ts --apply                                           # 명시 승인 후에만 반영
 * 원문(rawJson·address)은 바꾸지 않고 themes_*·area_code(비어 있을 때만)만 갱신한다.
 */
import { eq } from "drizzle-orm";
import { db } from "../db";
import { festivals } from "../db/schema";
import { extractThemes } from "../lib/tourapi/normalizer";
import { resolveAreaCodeFromAddress } from "../lib/regions";
import { extractTourIntroProgram } from "../lib/content";

const apply = process.argv.includes("--apply");

async function main() {
  const rows = await db.select().from(festivals);
  let themeChanges = 0,
    areaFills = 0;
  for (const f of rows) {
    const themes = extractThemes({
      title: f.title,
      overview: f.overview,
      eventPlace: f.eventPlace,
      program: extractTourIntroProgram(f.rawJson),
    });
    const csv = themes.length ? `,${themes.join(",")},` : null;
    const area = f.areaCode ? null : resolveAreaCodeFromAddress(f.address);
    const patch: Partial<typeof festivals.$inferInsert> = {};
    if (csv !== f.themesCsv) {
      patch.themesCsv = csv;
      patch.themesJson = themes.length ? JSON.stringify(themes) : null;
      themeChanges++;
      console.log(`theme ${f.contentId} ${f.title}: ${f.themesCsv} -> ${csv}`);
    }
    if (area) {
      patch.areaCode = area;
      areaFills++;
      console.log(`area  ${f.contentId} ${f.title}: (none) -> ${area} [${f.address}]`);
    }
    if (apply && Object.keys(patch).length)
      await db.update(festivals).set(patch).where(eq(festivals.contentId, f.contentId));
  }
  console.log(
    `${apply ? "APPLIED" : "DRY-RUN"} rows=${rows.length} themeChanges=${themeChanges} areaFills=${areaFills}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
