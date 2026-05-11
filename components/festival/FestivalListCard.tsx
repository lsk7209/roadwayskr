import Image from "next/image";
import Link from "next/link";
import type { Festival } from "@/db";

interface FestivalListCardProps {
  festival: Pick<
    Festival,
    | "contentId"
    | "slug"
    | "title"
    | "startDate"
    | "endDate"
    | "address"
    | "imageUrl"
  >;
  href: string;
  titleLevel?: "h2" | "h3";
  priority?: boolean;
}

const TITLE_CLASS =
  "line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--color-ink)]";

export function FestivalListCard({
  festival,
  href,
  titleLevel = "h2",
  priority = false,
}: FestivalListCardProps) {
  const TitleTag = titleLevel === "h3" ? "h3" : "h2";

  return (
    <li className="h-full min-w-0">
      <Link href={href} className="group block h-full min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[var(--color-surface-strong)]">
          {festival.imageUrl ? (
            <Image
              src={festival.imageUrl}
              alt={festival.title}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-muted)]">
              썸네일 준비중
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-ink)] shadow-[var(--shadow-float)]">
            주말 추천
          </span>
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[var(--color-ink)] shadow-[var(--shadow-float)]"
          >
            ♡
          </span>
        </div>

        <div className="min-w-0 pt-3">
          <TitleTag className={TITLE_CLASS}>{festival.title}</TitleTag>
          <p className="mt-1 text-sm leading-5 text-[var(--color-muted)]">
            {festival.startDate} ~ {festival.endDate}
          </p>
          {festival.address && (
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-[var(--color-muted)]">
              {festival.address}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
