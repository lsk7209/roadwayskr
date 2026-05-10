import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, gte, sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { findThemeBySlug, THEMES } from "@/lib/themes";

export const revalidate = 3600;

interface Params {
  params: Promise<{ themeSlug: string }>;
}

const SITE_URL = process.env.SITE_URL ?? "https://roadways.kr";
const MIN_ITEMS_FOR_INDEX = 3;

export async function generateStaticParams() {
  return THEMES.map((theme) => ({ themeSlug: theme.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const parsed = await parseParams(params);
  if (!parsed) return {};

  const count = await getCount(parsed.theme.name);
  const indexable = count >= MIN_ITEMS_FOR_INDEX;

  return {
    title: `${parsed.theme.name} 일정`,
    description: `${parsed.theme.name}로 분류된 진행 중·예정 축제와 행사 ${count}건을 정리했습니다. 지역, 일정, 장소를 한눈에 확인하세요.`,
    alternates: {
      canonical: `${SITE_URL}/테마/${parsed.theme.slug}`,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function ThemePage({ params }: Params) {
  const parsed = await parseParams(params);
  if (!parsed) return notFound();

  const { theme } = parsed;
  const today = new Date().toISOString().slice(0, 10);
  const items = await db
    .select()
    .from(festivals)
    .where(
      and(
        gte(festivals.endDate, today),
        sql`${festivals.isIndexable} = 1`,
        sql`${festivals.themesCsv} LIKE ${`%,${theme.name},%`}`,
      ),
    )
    .orderBy(festivals.startDate)
    .limit(80);

  return (
    <article className="prose-ko">
      <nav className="mb-2 text-xs text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:underline">
          홈
        </Link>{" "}
        ›{" "}
        <Link href="/테마" className="hover:underline">
          테마별
        </Link>{" "}
        › <span>{theme.name}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">
        {theme.name} 일정
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {theme.description}. 진행 중·예정 행사 {items.length}건
      </p>

      {items.length < MIN_ITEMS_FOR_INDEX ? (
        <p className="mt-6 rounded border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-muted)]">
          이 테마는 현재 행사 수가 적어 검색 색인은 보류합니다. 더 넓은 지역별
          페이지나 이번 주말 페이지에서 행사를 확인해 주세요.
        </p>
      ) : (
        <ul className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((festival) => (
            <li
              key={festival.contentId}
              className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-card)]"
            >
              <Link href={`/축제/${festival.contentId}/${festival.slug}`}>
                {festival.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={festival.imageUrl}
                    alt={festival.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-semibold">{festival.title}</h2>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {festival.startDate} ~ {festival.endDate}
                  </p>
                  {festival.address && (
                    <p className="mt-1 truncate text-xs text-[var(--color-ink-muted)]">
                      {festival.address}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

async function parseParams(params: Params["params"]) {
  const { themeSlug } = await params;
  const theme = findThemeBySlug(decodeURIComponent(themeSlug));

  return theme ? { theme } : null;
}

async function getCount(themeName: string) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(festivals)
    .where(
      and(
        gte(festivals.endDate, today),
        sql`${festivals.isIndexable} = 1`,
        sql`${festivals.themesCsv} LIKE ${`%,${themeName},%`}`,
      ),
    );

  return Number(rows[0]?.cnt ?? 0);
}
