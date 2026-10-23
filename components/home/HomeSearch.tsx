"use client";

import { useState } from "react";
import { AREAS } from "@/lib/regions";

/**
 * 날짜·지역 선택 → 기존 목록 URL로 이동한다. 새 라우트·쿼리 규약을 만들지 않는다.
 * 전국 + 이번 주말 → /weekend, 지역 선택 시에도 표시된 주말 범위를 유지한다.
 */
export function HomeSearch({
  weekendLabel,
  from,
  to,
}: {
  weekendLabel: string;
  from: string;
  to: string;
}) {
  const [slug, setSlug] = useState("");

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:gap-0 md:border md:border-[var(--color-control)] md:bg-[var(--color-card)]"
      action={slug ? `/regions/${encodeURIComponent(slug)}` : "/weekend"}
      method="get"
    >
      {slug && (
        <>
          <input type="hidden" name="from" value={from} />
          <input type="hidden" name="to" value={to} />
        </>
      )}
      <div className="flex items-center gap-3 border border-[var(--color-control)] bg-[var(--color-card)] px-4 py-3 md:border-0 md:border-r">
        <span className="text-sm font-semibold text-[var(--color-muted)]">
          언제
        </span>
        <span className="text-base font-semibold">{weekendLabel}</span>
      </div>
      <label className="flex items-center gap-3 border border-[var(--color-control)] bg-[var(--color-card)] px-4 py-3 md:border-0">
        <span className="text-sm font-semibold text-[var(--color-muted)]">
          어디
        </span>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="min-h-[24px] w-full bg-transparent text-base font-semibold"
        >
          <option value="">전국</option>
          {AREAS.map((a) => (
            <option key={a.code} value={a.slug}>
              {a.shortName}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="min-h-[48px] bg-[var(--color-ink)] px-8 text-base font-bold text-[var(--color-card)] transition-colors hover:bg-[var(--color-body)]"
      >
        갈 곳 찾기 →
      </button>
    </form>
  );
}
