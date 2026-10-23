import { SafeImage } from "./SafeImage";
import { FestivalLink as Link } from "./FestivalLink";
import type { Festival } from "@/db";
import { festivalPeriod } from "@/lib/festival-facts";
import {
  formatPeriod,
  isLongRunning,
  PERIOD_LABELS,
  periodState,
  recurrenceLabel,
} from "@/lib/festival-dates";
import { eventSourceNote } from "@/lib/event-source-notes";

interface FestivalListCardProps {
  festival: Pick<
    Festival,
    | "contentId"
    | "slug"
    | "title"
    | "startDate"
    | "endDate"
    | "address"
    | "imageUrl"
  > &
    Partial<Pick<Festival, "status" | "rawJson" | "playTime">>;
  href: string;
  titleLevel?: "h2" | "h3";
  priority?: boolean;
  /**
   * Must match the parent grid's actual column breakpoints so the browser
   * requests an image close to its real rendered width. Defaults to the
   * 1/2/3/4-column grid used on most listing pages; pass an explicit value
   * when the parent uses a different column layout (e.g. weekend's 2-col).
   */
  sizes?: string;
}

const DEFAULT_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

const TITLE_CLASS =
  "line-clamp-2 text-lg font-bold leading-snug text-[var(--color-ink)]";

export function FestivalListCard({
  festival,
  href,
  titleLevel = "h2",
  priority = false,
  sizes = DEFAULT_SIZES,
}: FestivalListCardProps) {
  const TitleTag = titleLevel === "h3" ? "h3" : "h2";
  const period = festivalPeriod(festival);
  const note = eventSourceNote({ ...festival, ...period });
  const shown = note?.officialOccurrence ?? period;
  const longRunning = !note?.officialOccurrence && isLongRunning(period.startDate, period.endDate);

  return (
    <li className="h-full min-w-0">
      <Link href={href} className="group block h-full min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[var(--color-surface-strong)]">
          {festival.imageUrl ? (
            <SafeImage
              src={festival.imageUrl}
              alt={festival.title}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-muted)]">
              썸네일 준비중
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-[4px] bg-[var(--color-card)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] ring-1 ring-[var(--color-ink)]">
            {
              PERIOD_LABELS[
                periodState(shown.startDate, shown.endDate, festival.status)
              ]
            }
          </span>
        </div>

        <div className="min-w-0 pt-3">
          <TitleTag className={TITLE_CLASS}>{festival.title}</TitleTag>
          <p className="mt-1 text-sm leading-5 text-[var(--color-muted)]">
            {formatPeriod(shown.startDate, shown.endDate)}
            {longRunning && " · 장기·상설 행사"}
          </p>
          <p
            className={
              note?.recurrence || note?.programs
                ? "mt-1 text-sm leading-5 text-[var(--color-muted)]"
                : "mt-1.5 inline-block rounded-[4px] bg-[var(--color-unknown-bg)] px-2 py-0.5 text-sm font-semibold leading-5 text-[var(--color-unknown-text)]"
            }
          >
            {note?.recurrence
              ? recurrenceLabel(note.recurrence)
              : note?.programs
                ? "여러 장소 · 프로그램별 일정 확인"
                : "운영일 확인 필요"}
          </p>
          {festival.address && (
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-[var(--color-muted)]">
              {festival.address}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
