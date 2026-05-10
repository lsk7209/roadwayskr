import type { Festival } from "@/db";

interface Props {
  festival: Festival;
}

export function CuratorNote({ festival }: Props) {
  if (!festival.curatorNote) return null;

  return (
    <aside className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
        <span className="inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand)]">
          큐레이터 코멘트
        </span>
        <span>직접 큐레이션한 한 줄</span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-ink)]">
        {festival.curatorNote}
      </p>
    </aside>
  );
}
