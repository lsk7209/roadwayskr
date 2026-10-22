import Link from "next/link";
import type { ReactNode } from "react";
import type { GuideBlock } from "@/lib/guides/types";

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/** `[텍스트](/경로)` 형태의 내부 링크만 허용한다. 외부 링크는 본문에 넣지 않는다. */
export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push(
      <Link
        key={`${index}-${match[2]}`}
        href={match[2]}
        className="text-[var(--color-brand)] underline underline-offset-2"
      >
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "ul":
            return (
              <ul key={i} className="list-disc pl-5 space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal pl-5 space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "tip":
            return (
              <aside
                key={i}
                className="my-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--color-brand)]">
                  {block.title}
                </p>
                <p className="mt-1 text-[0.95rem] leading-7">
                  {renderInline(block.text)}
                </p>
              </aside>
            );
          default:
            return <p key={i}>{renderInline(block.text)}</p>;
        }
      })}
    </>
  );
}
