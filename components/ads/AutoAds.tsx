"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isAdExcludedPath } from "@/lib/ad-eligibility";

interface AutoAdsProps {
  publisherId?: string;
}

export function AutoAds({ publisherId }: AutoAdsProps) {
  const pathname = usePathname() ?? "/";
  const trimmedPublisherId = publisherId?.trim() ?? "";

  if (!/^ca-pub-\d{16}$/.test(trimmedPublisherId)) {
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
