import Image from "next/image";
import Link from "next/link";
import type { Festival } from "@/db";

interface FestivalListCardProps {
  festival: Pick<
    Festival,
    "contentId" | "slug" | "title" | "startDate" | "endDate" | "address" | "imageUrl"
  >;
  href: string;
  titleLevel?: "h2" | "h3";
}

const TITLE_CLASS =
  "line-clamp-2 font-semibold text-[15px] leading-snug text-[var(--color-ink)] sm:text-base";

export function FestivalListCard({
  festival,
  href,
  titleLevel = "h2",
}: FestivalListCardProps) {
  const TitleTag = titleLevel === "h3" ? "h3" : "h2";

  return (
    <li className="h-full">
      <Link
        href={href}
        className="group flex h-full overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] transition-colors duration-200 hover:border-[var(--color-brand)] hover:shadow-sm"
      >
        <div className="relative aspect-[16/9] w-full bg-[var(--color-line)] sm:aspect-[16/10]">
          {festival.imageUrl ? (
            <Image
              src={festival.imageUrl}
              alt={festival.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-ink-muted)]">
              썸네일 준비중
            </div>
          )}
        </div>

        <div className="p-4">
          <TitleTag className={TITLE_CLASS}>{festival.title}</TitleTag>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {festival.startDate} ~ {festival.endDate}
          </p>
          {festival.address && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {festival.address}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
