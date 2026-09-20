import type { Festival } from "@/db";
import { cleanTourText } from "@/lib/content";
import { festivalPeriod, explicitFree } from "@/lib/festival-facts";
import { eventSourceNote } from "@/lib/event-source-notes";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  festival: Festival;
  url: string;
}

/**
 * Schema.org Festival/Event JSON-LD
 * - 구글 이벤트 캐러셀·리치 결과 진입 핵심
 * - eventStatus / eventAttendanceMode 필수
 * - 이미지·좌표 있을 때만 추가 (없으면 omit)
 */
export function EventSchema({ festival, url }: Props) {
  const description = cleanTourText(festival.description ?? festival.overview);
  const address = cleanTourText(festival.address);
  const eventPlace = cleanTourText(festival.eventPlace);
  const period = festivalPeriod(festival);
  // A multi-program venue guide is not one precisely scheduled Event.
  if (
    !period.startDate ||
    !address ||
    !eventPlace ||
    eventSourceNote({ ...festival, ...period })?.programs
  )
    return null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: festival.title,
    url,
    description: description ?? undefined,
    startDate: period.startDate,
    endDate: period.endDate ?? undefined,
    eventStatus:
      festival.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: festival.organizer
      ? { "@type": "Organization", name: festival.organizer }
      : undefined,
  };

  if (address) {
    schema.location = {
      "@type": "Place",
      name: eventPlace ?? address,
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressCountry: "KR",
      },
      ...(festival.lat && festival.lng
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: festival.lat,
              longitude: festival.lng,
            },
          }
        : {}),
    };
  }

  if (festival.imageUrl) {
    schema.image = [festival.imageUrl];
  }

  if (explicitFree(festival.fee)) {
    schema.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    };
  }

  // undefined 키 정리
  const clean = JSON.parse(JSON.stringify(schema));

  return <JsonLd id="ld-event" data={clean} />;
}
