import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GUIDES, findGuideBySlug, relatedGuides } from "@/lib/guides";
import { GuideBody, renderInline } from "@/components/guides/GuideBody";
import { JsonLd, buildBreadcrumbListLd } from "@/components/seo/JsonLd";
import { PageAds } from "@/components/ads/PageAds";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);
  if (!guide) return {};
  const url = `${SITE_URL}/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [`${SITE_URL}/about/curator`],
    },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    mainEntityOfPage: url,
    inLanguage: "ko-KR",
    author: {
      "@type": "Person",
      name: "고고지기",
      url: `${SITE_URL}/about/curator`,
    },
    publisher: {
      "@type": "Organization",
      name: "여행고고",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
  };
  const breadcrumbLd = buildBreadcrumbListLd([
    { name: "홈", url: SITE_URL },
    { name: "가이드", url: `${SITE_URL}/guides` },
    { name: guide.title, url },
  ]);
  const related = relatedGuides(guide);

  return (
    <article className="prose-body prose-ko max-w-3xl">
      <JsonLd id="guide-article-jsonld" data={articleLd} />
      <JsonLd id="guide-breadcrumb-jsonld" data={breadcrumbLd} />

      <nav className="mb-2 text-xs text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:underline">
          홈
        </Link>{" "}
        ›{" "}
        <Link href="/guides" className="hover:underline">
          가이드
        </Link>{" "}
        › <span>{guide.category}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {guide.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        글{" "}
        <Link href="/about/curator" className="underline underline-offset-2">
          고고지기
        </Link>{" "}
        · 작성 <time dateTime={guide.publishedAt}>{guide.publishedAt}</time>
        {guide.updatedAt !== guide.publishedAt && (
          <>
            {" "}
            · 수정 <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>
          </>
        )}
      </p>

      <section className="my-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-semibold">요약</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
          {guide.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <GuideBody blocks={guide.body} />

      {guide.faq && guide.faq.length > 0 && (
        <section>
          <h2>자주 묻는 질문</h2>
          <dl className="space-y-4">
            {guide.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold">Q. {item.q}</dt>
                <dd className="mt-1">{renderInline(item.a)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2>함께 읽으면 좋은 글</h2>
          <ul className="list-disc space-y-1 pl-5">
            {related.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="text-[var(--color-brand)] underline underline-offset-2"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <hr className="my-8 border-[var(--color-line)]" />
      <p className="text-xs text-[var(--color-ink-muted)]">
        이 글은 일반적인 축제 나들이 요령을 정리한 것이에요. 개별 행사의 일정과
        운영 방식은 주최 측 공식 안내를 기준으로 확인해 주세요. 내용 오류는{" "}
        <Link href="/contact" className="underline">
          문의 페이지
        </Link>
        로 알려 주세요.
      </p>
      <PageAds eligible />
    </article>
  );
}
