export type ActionName = "official_link_open" | "map_open";
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };
export function trackAction(
  name: ActionName,
  contentId: number,
  target = typeof window === "undefined"
    ? undefined
    : (window as AnalyticsWindow),
) {
  // Existing gtag owns consent. Do not initialize a tag, alter consent, or send
  // free text, full destination URLs, query strings, or user identifiers.
  if (
    !target ||
    target.location.hostname !== "roadways.kr" ||
    !Number.isSafeInteger(contentId) ||
    contentId <= 0
  )
    return;
  target.gtag?.("event", name, {
    content_id: contentId,
    page_type: "festival",
  });
}
