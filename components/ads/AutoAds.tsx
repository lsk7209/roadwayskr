import Script from "next/script";

interface AutoAdsProps {
  publisherId?: string;
}

export function AutoAds({ publisherId }: AutoAdsProps) {
  const trimmedPublisherId = publisherId?.trim() ?? "";

  if (!/^ca-pub-\d{16}$/.test(trimmedPublisherId)) {
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
