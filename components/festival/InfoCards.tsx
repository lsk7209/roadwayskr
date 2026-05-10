/**
 * 페르소나 시그니처: 모든 행사 페이지에 강제 적용되는 4대 기본 정보 카드.
 * - 거리: 클라이언트 위치 기반 (없으면 주요 도시 기준 표기)
 * - 운영시간: useTime / playTime
 * - 입장료: fee (free 추정 시 "무료" 강조)
 * - 주차: TourAPI에 직접 필드 없음 → eventPlace + tel + 큐레이터 보강 영역
 */

import type { Festival } from "@/db";
import { cleanTourText } from "@/lib/content";

interface Props {
  festival: Festival;
}

export function InfoCards({ festival }: Props) {
  const fee = cleanTourText(festival.fee);
  const playTime = cleanTourText(festival.playTime);
  const useTime = cleanTourText(festival.useTime);
  const cards: Array<{
    label: string;
    value: string;
    hint?: string;
    accent?: boolean;
  }> = [
    {
      label: "기간",
      value:
        festival.startDate && festival.endDate
          ? `${festival.startDate} ~ ${festival.endDate}`
          : "확인 필요",
      hint: festival.status === "ongoing" ? "진행 중" : undefined,
      accent: festival.status === "ongoing",
    },
    {
      label: "운영 시간",
      value: playTime ?? useTime ?? "공식 발표 기준",
    },
    {
      label: "입장료",
      value: festival.feeIsFree ? "무료" : (fee ?? "공식 발표 기준"),
      accent: festival.feeIsFree === true,
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
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 my-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-card)] p-3"
        >
          <dt className="text-xs text-[var(--color-ink-muted)]">{c.label}</dt>
          <dd
            className={
              "mt-1 text-sm font-semibold " +
              (c.accent
                ? "text-[var(--color-brand)]"
                : "text-[var(--color-ink)]")
            }
          >
            {c.value}
          </dd>
          {c.hint && (
            <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
              {c.hint}
            </p>
          )}
        </div>
      ))}
    </dl>
  );
}
