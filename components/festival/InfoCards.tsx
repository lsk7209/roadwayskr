/**
 * 페르소나 시그니처: 모든 행사 페이지에 강제 적용되는 4대 기본 정보 카드.
 * - 거리: 클라이언트 위치 기반 (없으면 주요 도시 기준 표기)
 * - 운영시간: useTime / playTime
 * - 입장료: fee (free 추정 시 "무료" 강조)
 * - 주차: TourAPI에 직접 필드 없음 → eventPlace + tel + 큐레이터 보강 영역
 */

import type { Festival } from "@/db";
import { cleanTourText } from "@/lib/content";
import {
  festivalPeriod,
  explicitFree,
  operatingTime,
} from "@/lib/festival-facts";
import {
  formatPeriod,
  periodState,
  PERIOD_LABELS,
  scheduleOnDate,
  seoulDate,
} from "@/lib/festival-dates";
import { eventSourceNote } from "@/lib/event-source-notes";

interface Props {
  festival: Festival;
}

export function InfoCards({ festival }: Props) {
  const fee = cleanTourText(festival.fee);
  const period = festivalPeriod(festival);
  const note = eventSourceNote({ ...festival, ...period });
  const state = periodState(period.startDate, period.endDate, festival.status);
  const todaySchedule = scheduleOnDate(
    { ...period, status: festival.status, recurrence: note?.recurrence },
    seoulDate(),
  );
  const cards: Array<{
    label: string;
    value: string;
    hint?: string;
    accent?: boolean;
  }> = [
    {
      label: "기간",
      value: formatPeriod(period.startDate, period.endDate),
      hint: PERIOD_LABELS[state],
    },
    {
      label: "운영 시간",
      value: note?.programs
        ? "프로그램별 시간 참조"
        : (operatingTime(festival) ?? "운영 시간 미확인"),
      hint:
        todaySchedule === "CONFIRMED_SCHEDULE_ON_DATE"
          ? "오늘 일정 있음 · 당일 공지 확인"
          : todaySchedule === "NO_SCHEDULE_ON_DATE"
            ? "오늘은 운영 일정 없음"
            : todaySchedule === "CANCELLED_OCCURRENCE"
              ? "취소 안내 확인"
              : "개별 운영일 확인 필요",
    },
    {
      label: "입장료",
      value: fee ?? "요금 미확인",
      accent: explicitFree(fee),
    },
    {
      label: "어린이 동반",
      value:
        festival.familyFriendly === true
          ? "가능"
          : festival.familyFriendly === false
            ? "제한 있음"
            : "확인 필요",
      accent: festival.familyFriendly === true,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3 sm:p-4"
        >
          <dt className="text-xs text-[var(--color-ink-muted)]">{c.label}</dt>
          <dd
            className={
              "mt-1 text-sm leading-tight font-semibold break-words " +
              (c.accent
                ? "text-[var(--color-brand)]"
                : "text-[var(--color-ink)]")
            }
          >
            {c.value}
          </dd>
          {c.hint && (
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-ink-muted)]">
              {c.hint}
            </p>
          )}
        </div>
      ))}
    </dl>
  );
}
