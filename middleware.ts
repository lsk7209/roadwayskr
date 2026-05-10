import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const KOREAN_ROUTE_REWRITES: Array<[string, string]> = [
  ["/\uC774\uBC88\uC8FC\uB9D0", "/weekend"],
  ["/\uC9C0\uC5ED", "/regions"],
  ["/\uCD95\uC81C", "/festivals"],
  ["/\uD14C\uB9C8", "/themes"],
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
  const normalizedPath = normalizePath(pathname);
  const monthlyMatch = normalizedPath.match(MONTHLY_AREA_PATTERN);
  if (monthlyMatch) {
    const [, year, month, areaSlug] = monthlyMatch;
    return `/monthly/${year}/${month}/${areaSlug}`;
  }

  for (const [source, destination] of KOREAN_ROUTE_REWRITES) {
    if (normalizedPath === source) {
      return destination;
    }
    if (normalizedPath.startsWith(`${source}/`)) {
      return normalizedPath.replace(source, destination);
    }
  }

  return null;
}

function normalizePath(pathname: string) {
  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.replace(/\/+$/, "")
    : pathname;
}

function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export const config = {
  matcher: [
    "/\uC774\uBC88\uC8FC\uB9D0/:path*",
    "/\uC9C0\uC5ED/:path*",
    "/\uCD95\uC81C/:path*",
    "/\uD14C\uB9C8/:path*",
    "/:year(20\\d{2})/:month([1-9]|1[0-2])/:areaSlug*",
  ],
};
