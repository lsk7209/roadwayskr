import Link from "next/link";

export const metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <article className="prose-ko mx-auto max-w-2xl py-16 text-center">
      <p className="text-6xl font-bold text-[var(--color-brand)]">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        주소가 정확한지 다시 확인해 주세요. 페이지가 삭제되었거나 이동되었을 수
        있습니다.
      </p>
      <div className="not-prose mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white"
        >
          홈으로
        </Link>
        <Link
          href="/weekend"
          className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold"
        >
          이번 주말 행사
        </Link>
      </div>
    </article>
  );
}
