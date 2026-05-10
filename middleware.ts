import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const KOREAN_ROUTE_REWRITES: Array<[string, string]> = [
  ["/이번주말", "/weekend"],
  ["/지역", "/regions"],
  ["/축제", "/festivals"],
  ["/테마", "/themes"],
];

const MONTHLY_AREA_PATTERN = /^\/(20\d{2})\/([1-9]|1[0-2])\/(.+)$/;

export function middleware(request: NextRequest) {
  const pathname = decodePathname(request.nextUrl.pathname);
  const rewritePathname = getRewritePathname(pathname);

  if (!rewritePathname) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = rewritePathname;
  return NextResponse.rewrite(url);
}

function getRewritePathname(pathname: string): string | null {
  const monthlyMatch = pathname.match(MONTHLY_AREA_PATTERN);
  if (monthlyMatch) {
    const [, year, month, areaSlug] = monthlyMatch;
    return `/monthly/${year}/${month}/${areaSlug}`;
  }

  for (const [source, destination] of KOREAN_ROUTE_REWRITES) {
    if (pathname === source) return destination;
    if (pathname.startsWith(`${source}/`)) {
      return pathname.replace(source, destination);
    }
  }

  return null;
}

function decodePathname(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}
