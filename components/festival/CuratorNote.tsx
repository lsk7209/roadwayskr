import type { Festival } from "@/db";

interface Props {
  festival: Festival;
}

/**
 * 큐레이터 한 줄 코멘트.
 * - 페르소나 JSON 기반으로 LLM이 페이지마다 다른 표현으로 생성 (후속 단계)
 * - 비어 있으면 컴포넌트 자체를 렌더하지 않음 (가짜 후기 금지)
 */
export function CuratorNote({ festival }: Props) {
  if (!festival.curatorNote) return null;

  return (
    <aside className="my-6 rounded-lg border-l-4 border-[var(--color-brand)] bg-[var(--color-card)] p-4">
      <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)] mb-1">
        <span className="font-semibold text-[var(--color-brand)]">
          고고지기
        </span>
        <span>큐레이터 한 줄</span>
      </div>
      <p className="text-sm leading-relaxed">{festival.curatorNote}</p>
    </aside>
  );
}
