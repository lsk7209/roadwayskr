import Link from "next/link";
import { listHref, type DateRange } from "@/lib/festival-list";
import { relativeMonth } from "@/lib/festival-dates";

export function ListNavigation({
  path,
  range,
  page,
  pages,
}: {
  path: string;
  range?: DateRange;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="목록 페이지"
      className="my-6 flex flex-wrap items-center gap-5 text-sm"
    >
      {page > 1 && (
        <Link className="underline" href={listHref(path, range, page - 1)}>
          이전 페이지
        </Link>
      )}
      <span>
        {page} / {pages} 페이지
      </span>
      {page < pages && (
        <Link className="underline" href={listHref(path, range, page + 1)}>
          다음 페이지
        </Link>
      )}
    </nav>
  );
}

export function MonthLinks({ areaSlug }: { areaSlug: string }) {
  return (
    <nav aria-label="월별 행사" className="my-4 flex flex-wrap gap-4 text-sm">
      {[0, 1].map((offset) => {
        const { year, month } = relativeMonth(offset);
        return (
          <Link
            className="underline"
            key={offset}
            href={`/monthly/${year}/${month}/${areaSlug}`}
          >
            {offset ? "다음 달" : "이번 달"} ({month}월) 행사
          </Link>
        );
      })}
    </nav>
  );
}
