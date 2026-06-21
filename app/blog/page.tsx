import type { Metadata } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";

import { db, festivals } from "@/db";
import { FestivalListCard } from "@/components/festival/FestivalListCard";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Roadways Blog - Korean festival guides",
  description:
    "Roadways blog lists Korean festival guides, weekend event updates, regional travel ideas, and official-source checks for visitors planning local trips.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export const revalidate = 3600;

async function getLatestFestivalGuides() {
  return db
    .select()
    .from(festivals)
    .where(sql`${festivals.isIndexable} = 1`)
    .orderBy(desc(festivals.updatedAt))
    .limit(24);
}

export default async function BlogPage() {
  const latest = await getLatestFestivalGuides().catch(() => []);

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-[0.12em] text-[var(--color-brand)]">
          ROADWAYS BLOG
        </p>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-[var(--color-ink)] sm:text-[38px]">
          Korean Festival Guides and Weekend Travel Notes
        </h1>
        <p className="prose-body mt-4 text-[1.04rem] leading-8 text-[var(--color-ink-muted)]">
          Recent Roadways guides collect festival dates, regions, themes, venue
          context, and official-source checks so readers and crawlers can reach
          useful event pages from one stable archive.
        </p>
      </section>

      {latest.length === 0 ? (
        <section className="rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
          <h2 className="text-[24px] font-semibold leading-tight">
            Guides Are Being Updated
          </h2>
          <p className="prose-body mt-3 leading-8 text-[var(--color-ink-muted)]">
            Festival guide data is not available right now. Use the regional
            and weekend indexes while the latest blog archive refreshes.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/weekend" className="text-[var(--color-brand)] hover:underline">
              Weekend festivals
            </Link>
            <Link href="/regions" className="text-[var(--color-brand)] hover:underline">
              Regional guides
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--color-line-soft)] bg-white p-6">
          <div className="mb-5">
            <h2 className="text-[24px] font-semibold leading-tight">
              Latest Roadways Guides
            </h2>
            <p className="prose-body mt-2 text-[var(--color-ink-muted)]">
              Crawlable links to recently updated festival and local event
              guides.
            </p>
          </div>
          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((festival, index) => (
              <FestivalListCard
                key={festival.contentId}
                href={`/festivals/${festival.contentId}/${festival.slug}`}
                festival={festival}
                titleLevel="h3"
                priority={index === 0}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
