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
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${trimmedPublisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script id="adsbygoogle-init" strategy="afterInteractive">
        {`
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({
            google_ad_client: "${trimmedPublisherId}",
            enable_page_level_ads: true
          });
        `}
      </Script>
    </>
  );
}
