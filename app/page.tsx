import { db, festivals } from "@/db";
import { and, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";

export const revalidate = 3600; // 1시간 ISR

async function getThisWeekend() {
  const today = new Date();
  const day = today.getUTCDay(); // 0=일
  const sat = new Date(today);
  sat.setUTCDate(today.getUTCDate() + ((6 - day + 7) % 7));
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return db
    .select()
    .from(festivals)
    .where(
      and(
        lte(festivals.startDate, fmt(sun)),
        gte(festivals.endDate, fmt(sat)),
        sql`${festivals.isIndexable} = 1`,
      ),
    )
    .limit(12);
}

export default async function Home() {
  const weekend = await getThisWeekend().catch(() => []);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          이번 주말, 어디 갈까요?
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          전국 축제·행사를 거리·운영시간·주차·어린이 동반 정보까지 정리해
          드려요.
        </p>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold">이번 주말 진행 중·시작하는 행사</h2>
          <Link
            href="/이번주말"
            className="text-sm text-[var(--color-brand)] hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {weekend.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            동기화된 데이터가 아직 없어요. <code>pnpm sync:tourapi:full</code>{" "}
            먼저 실행해 주세요.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weekend.map((f) => (
              <li
                key={f.contentId}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] overflow-hidden"
              >
                <Link href={`/축제/${f.contentId}/${f.slug}`}>
                  {f.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={f.imageUrl}
                      alt=""
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {f.startDate} ~ {f.endDate}
                    </p>
                    {f.address && (
                      <p className="mt-1 text-xs text-[var(--color-ink-muted)] truncate">
                        {f.address}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
