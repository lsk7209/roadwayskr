import type { Metadata } from "next";
import Link from "next/link";

import { GUIDES } from "@/lib/guides";
import { JsonLd, buildCollectionPageLd } from "@/components/seo/JsonLd";
import { PageAds } from "@/components/ads/PageAds";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "축제 나들이 가이드",
  description:
    "축제 취소 확인법, 아이·부모님과 가는 요령, 주차와 대중교통, 비 오는 날 판단 기준까지 축제 나들이 전에 알아 두면 좋은 내용을 정리했습니다.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

export default function GuidesIndex() {
  const collectionLd = buildCollectionPageLd({
    name: "축제 나들이 가이드",
    description: "축제 나들이 준비·교통·일정·정보 확인 가이드 모음",
    url: `${SITE_URL}/guides`,
    items: GUIDES.map((g) => ({
      name: g.title,
      url: `${SITE_URL}/guides/${g.slug}`,
    })),
  });

  return (
    <div className="space-y-8">
      <JsonLd id="guides-collection-jsonld" data={collectionLd} />
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">축제 나들이 가이드</h1>
        <p className="mt-3 leading-8 text-[var(--color-ink-muted)]">
          행사 목록만으로는 알기 어려운 것들을 정리했어요. 출발 전에 무엇을
          확인할지, 누구와 가는지에 따라 무엇을 챙길지, 붐비는 시간을 어떻게
          피할지 상황별로 읽어 보세요.
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="block h-full rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-5 transition hover:border-[var(--color-brand)]"
            >
              <p className="text-xs font-semibold text-[var(--color-brand)]">
                {g.category}
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-snug">
                {g.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-ink-muted)]">
                {g.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <PageAds eligible />
    </div>
  );
}
