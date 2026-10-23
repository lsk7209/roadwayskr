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

type RowFestival = Pick<
  Festival,
  "contentId" | "slug" | "title" | "startDate" | "endDate" | "address"
> &
  Partial<Pick<Festival, "status" | "rawJson" | "playTime">>;

/**
 * 일정형 목록 행. 왼쪽 기간 칸은 "행사 기간"이며 실제 운영일이 아니다.
 * 운영일이 확인된 경우(공식 회차·반복 요일)에만 확인 문구 대신 운영 정보를 보여준다.
 */
export function FestivalRow({
  festival,
  href,
  titleLevel = "h3",
}: {
  festival: RowFestival;
  href: string;
  titleLevel?: "h2" | "h3";
}) {
  const TitleTag = titleLevel;
  const period = festivalPeriod(festival);
  const note = eventSourceNote({ ...festival, ...period });
  const shown = note?.officialOccurrence ?? period;
  const longRunning =
    !note?.officialOccurrence && isLongRunning(period.startDate, period.endDate);
  const confirmed = Boolean(note?.recurrence || note?.programs);
  const state =
    PERIOD_LABELS[periodState(shown.startDate, shown.endDate, festival.status)];

  return (
    <li className="border-b border-[var(--color-line)] last:border-b-0">
      <Link
        href={href}
        className="grid grid-cols-[96px_1fr] gap-4 py-4 hover:bg-[var(--color-surface-soft)] sm:grid-cols-[140px_1fr]"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--color-muted)]">
            행사 기간
          </p>
          <p className="mt-0.5 text-sm font-bold leading-snug sm:text-base">
            {formatPeriod(shown.startDate, shown.endDate)}
          </p>
        </div>
        <div className="min-w-0">
          <TitleTag className="text-lg font-bold leading-snug">
            {festival.title}
          </TitleTag>
          {festival.address && (
            <p className="mt-0.5 line-clamp-1 text-sm text-[var(--color-muted)]">
              {festival.address}
            </p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-[4px] border border-[var(--color-ink)] px-2 py-0.5 text-xs font-semibold">
              {state}
            </span>
            {longRunning && (
              <span className="text-xs text-[var(--color-muted)]">
                장기·상설 행사
              </span>
            )}
            {confirmed ? (
              <span className="text-[var(--color-muted)]">
                {note?.recurrence
                  ? recurrenceLabel(note.recurrence)
                  : "여러 장소 · 프로그램별 일정 확인"}
              </span>
            ) : (
              <span className="rounded-[4px] bg-[var(--color-unknown-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-unknown-text)]">
                운영일 확인 필요
              </span>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}
