import { AutoAds } from "./AutoAds";
import CoupangAffiliateBanner from "@/components/affiliate/CoupangAffiliateBanner";

// 고유 콘텐츠가 적은 상태에서 제휴 배너는 AdSense 심사에 "광고 목적 사이트" 신호가 된다.
// 승인 전에는 끄고, 승인 후 NEXT_PUBLIC_AFFILIATE_ENABLED=true 로 다시 켠다.
const AFFILIATE_ENABLED = process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true";

/** Publicness, indexing and ad placement are separate decisions. */
export function PageAds({ eligible }: { eligible: boolean }) {
  if (!eligible) return null;
  return (
    <>
      <AutoAds
        publisherId={
          process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ??
          process.env.NEXT_PUBLIC_ADSENSE_PUB_ID
        }
      />
      {AFFILIATE_ENABLED ? <CoupangAffiliateBanner /> : null}
    </>
  );
}
