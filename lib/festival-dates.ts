/** Date-only ranges include both endpoints. Timed occurrences are [start, end). */
export function seoulDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function validDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === text
    ? text
    : null;
}

export function formatPeriod(start: unknown, end: unknown): string {
  const s = validDate(start),
    e = validDate(end);
  if (s && e && e < s) return "일정 확인 중";
  if (s && e) return s === e ? s : `${s} ~ ${e}`;
  if (s) return `${s}부터 · 종료일 확인 중`;
  if (e) return `${e}까지 · 시작일 확인 중`;
  return "일정 확인 중";
}

export function periodState(
  start: unknown,
  end: unknown,
  status?: string,
  now = new Date(),
) {
  if (status === "cancelled") return "cancelled";
  const s = validDate(start),
    e = validDate(end);
  if (!s || !e || e < s) return "unknown";
  const today = seoulDate(now);
  if (today > e || status === "ended") return "ended";
  return today < s ? "upcoming" : "ongoing";
}

export const PERIOD_LABELS = {
  cancelled: "행사 취소",
  unknown: "일정 확인 중",
  ended: "행사 기간 종료",
  upcoming: "행사 예정",
  ongoing: "행사 기간 중",
};

export interface CalendarEvent {
  startDate: string | null;
  endDate: string | null;
  recurrence?: { mode: string; isoWeekdays: number[] };
  cancelledDates?: string[];
  status?: string;
}

const ISO_WEEKDAY_LABELS = ["", "월", "화", "수", "목", "금", "토", "일"];

/**
 * Builds a human-readable recurrence phrase from recurrence.mode/isoWeekdays
 * instead of assuming every recurring event is Friday/Saturday. Unknown or
 * missing recurrence stays explicitly "unknown" rather than a guessed
 * schedule.
 */
export function recurrenceLabel(
  recurrence: CalendarEvent["recurrence"] | undefined,
): string {
  if (!recurrence) return "개별 운영일·시간 확인 필요";
  if (recurrence.mode === "daily") return "매일 운영 · 당일 변경 공지 확인";
  if (
    recurrence.mode === "iso_weekdays" &&
    Array.isArray(recurrence.isoWeekdays) &&
    recurrence.isoWeekdays.length > 0
  ) {
    const days = [...new Set(recurrence.isoWeekdays)]
      .filter((d) => d >= 1 && d <= 7)
      .sort((a, b) => a - b)
      .map((d) => ISO_WEEKDAY_LABELS[d]);
    if (days.length > 0) {
      return `${days.join("·")} 운영 · 당일 변경 공지 확인`;
    }
  }
  return "운영일 확인 필요 · 당일 변경 공지 확인";
}

export function scheduleOnDate(event: CalendarEvent, date: string) {
  const s = validDate(event.startDate),
    e = validDate(event.endDate);
  if (!s || !e || e < s || !validDate(date)) return "UNKNOWN_PERIOD";
  if (date < s || date > e) return "NO_SCHEDULE_ON_DATE";
  if (event.status === "cancelled" || event.cancelledDates?.includes(date))
    return "CANCELLED_OCCURRENCE";
  const recurrence = event.recurrence;
  if (!recurrence || recurrence.mode === "unknown")
    return "UNVERIFIED_SCHEDULE";
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
  return recurrence.mode === "daily" ||
    (recurrence.mode === "iso_weekdays" &&
      recurrence.isoWeekdays.includes(weekday))
    ? "CONFIRMED_SCHEDULE_ON_DATE"
    : "NO_SCHEDULE_ON_DATE";
}

export function withinTimeWindow(startsAt: string, endsAt: string, now: Date) {
  const start = Date.parse(startsAt),
    end = Date.parse(endsAt);
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start < end &&
    now.getTime() >= start &&
    now.getTime() < end
  );
}

export function monthRange(year: number, month: number) {
  const startIso = `${year}-${String(month).padStart(2, "0")}-01`;
  const endIso = `${year}-${String(month).padStart(2, "0")}-${new Date(Date.UTC(year, month, 0)).getUTCDate()}`;
  return { startIso, endIso };
}

export function relativeMonth(offset = 0, now = new Date()) {
  const [year, month] = seoulDate(now).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

/** Exclusive categories; counts sum to the monthly total. */
export function monthCategory(
  start: string | null,
  end: string | null,
  from: string,
  to: string,
) {
  if (!start || !end) return "일정 확인 중";
  if (start >= from && end <= to) return "이달 한정";
  if (start >= from) return "이달 시작";
  if (end <= to) return "이달 종료";
  return "여러 달에 걸친 행사";
}

/** Events spanning more than this many days sort after short-run events. */
export const LONG_RUNNING_DAYS = 31;

export function isLongRunning(start: unknown, end: unknown): boolean {
  const s = validDate(start),
    e = validDate(end);
  if (!s || !e || e < s) return false;
  return (
    (Date.parse(`${e}T00:00:00Z`) - Date.parse(`${s}T00:00:00Z`)) / 86400000 >
    LONG_RUNNING_DAYS
  );
}
