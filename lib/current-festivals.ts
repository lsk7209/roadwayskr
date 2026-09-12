import { and, eq, gte, inArray } from "drizzle-orm";
import { festivals } from "../db/schema";

/** Calendar dates in the Korean event directory must not follow server UTC. */
function getSeoulTodayIso(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentFestivalCondition(now = new Date()) {
  const today = getSeoulTodayIso(now);

  return and(
    eq(festivals.isIndexable, true),
    inArray(festivals.status, ["ongoing", "upcoming"]),
    gte(festivals.endDate, today),
  );
}

/**
 * "이번 주말"(다가오는 토·일)의 ISO 날짜를 Asia/Seoul 캘린더 기준으로 계산한다.
 * 서버 UTC의 요일(getUTCDay)로 계산하면 00:00~09:00 KST 구간에서 하루 밀리는
 * 버그가 생긴다(UTC 자정과 Seoul 자정이 9시간 어긋나므로). 반드시 이 함수를
 * 홈/주말 등 "이번 주말"을 계산하는 모든 곳에서 재사용한다.
 */
export function getWeekendRange(now = new Date()) {
  const todayIso = getSeoulTodayIso(now);
  const [year, month, date] = todayIso.split("-").map(Number);
  // Seoul 캘린더 날짜를 순수 날짜 연산용으로만 쓰는 UTC 앵커(실제 시각이 아님).
  const anchor = new Date(Date.UTC(year, month - 1, date));
  const dayOfWeek = anchor.getUTCDay(); // 0=일 ... 6=토
  const offsetToSaturday = (6 - dayOfWeek + 7) % 7;

  const sat = new Date(anchor);
  sat.setUTCDate(anchor.getUTCDate() + offsetToSaturday);
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { satIso: fmt(sat), sunIso: fmt(sun) };
}
