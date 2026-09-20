"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isAdExcludedPath } from "@/lib/ad-eligibility";
import { useEffect } from "react";

interface AutoAdsProps {
  publisherId?: string;
}

export function AutoAds({ publisherId }: AutoAdsProps) {
  const pathname = usePathname() ?? "/";
  const trimmedPublisherId = publisherId?.trim() ?? "";
  const enabled =
    /^ca-pub-\d{16}$/.test(trimmedPublisherId) && !isAdExcludedPath(pathname);
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.dataset.autoAdsLocation =
      location.pathname + location.search;
    // Auto Ads has no unload API. Dispose the whole document on internal
    // navigation, including routes which become empty or not-found after fetch.
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element)?.closest?.("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, location.href);
      if (
        url.origin !== location.origin ||
        (url.pathname === location.pathname && url.search === location.search)
      )
        return;
      if (
        url.pathname.startsWith("/festivals/") &&
        !location.pathname.startsWith("/festivals/")
      ) {
        try {
          sessionStorage.setItem(
            "festival-list-return",
            location.pathname + location.search,
          );
        } catch {
          /* optional */
        }
      }
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener("click", navigate, true);
    return () => document.removeEventListener("click", navigate, true);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  // 신뢰·문의·정책·관리 화면에서는 Auto ads 스크립트 자체를 로드하지 않는다.
  // 수동 광고 슬롯만 숨기는 것으로는 Auto ads가 여전히 해당 화면에 노출될 수 있다.
  if (isAdExcludedPath(pathname)) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-auto"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${trimmedPublisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
