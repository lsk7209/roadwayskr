import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { THEMES } from "@/lib/themes";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr").trim().replace(/\/+$/, "");

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "테마별 축제·행사",
  description:
    "벚꽃축제, 음식축제, 음악축제, 전통축제처럼 관심사별로 전국 축제와 행사를 모았습니다.",
  alternates: { canonical: `${SITE_URL}/themes` },
};

export default async function ThemesIndex() {
  const counts: Record<string, number> = await getCountsByTheme().catch(
    () => ({}),
  );

  return (
    <article className="prose-body prose-ko">
      <h1 className="text-3xl font-bold tracking-tight">테마별 축제·행사</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        관심사별로 진행 중·예정 행사를 골라볼 수 있어요.
      </p>

      <ul className="not-prose mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme) => {
          const count = counts[theme.name] ?? 0;
          return (
            <li key={theme.slug}>
              <Link
                href={`/themes/${theme.slug}`}
                className="group block h-full rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
              >
                <div className="font-semibold text-[var(--color-ink)]">
                  {theme.name}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {theme.description}
                </p>
                <div className="mt-3 text-sm text-[var(--color-ink-muted)]">
                  진행·예정 {count}건
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

async function getCountsByTheme() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select({
      themesCsv: festivals.themesCsv,
    })
    .from(festivals)
    .where(
      sql`${festivals.isIndexable} = 1 AND ${festivals.endDate} >= ${today}`,
    );

  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (!row.themesCsv) continue;

    for (const theme of THEMES) {
      if (row.themesCsv.includes(`,${theme.name},`)) {
        counts[theme.name] = (counts[theme.name] ?? 0) + 1;
      }
    }
  }

  return counts;
}

