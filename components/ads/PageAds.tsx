import { AutoAds } from "./AutoAds";
import CoupangAffiliateBanner from "@/components/affiliate/CoupangAffiliateBanner";
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
      <CoupangAffiliateBanner />
    </>
  );
}
