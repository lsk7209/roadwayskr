import type { Metadata } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://roadways.kr")
  .trim()
  .replace(/\/+$/, "");

/**
 * Page-level openGraph replaces (not merges with) the layout's openGraph, so
 * list pages must restate type/locale/siteName along with their own
 * title/description/url.
 */
export function shareMetadata(args: {
  title: string;
  description: string;
  url: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "여행고고",
      title: args.title,
      description: args.description,
      url: args.url,
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
    },
  };
}

/** Paginated lists: page N is its own canonical URL; arbitrary filters stay noindex. */
export function pageCanonical(path: string, page: number) {
  return `${SITE_URL}${path}${page > 1 ? `?page=${page}` : ""}`;
}
