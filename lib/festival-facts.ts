import { cleanTourText } from "./content";
import { validDate } from "./festival-dates";

export function festivalPeriod(festival: {
  startDate: string | null;
  endDate: string | null;
  rawJson?: string | null;
}) {
  let intro: Record<string, unknown> = {};
  try {
    const raw = JSON.parse(festival.rawJson ?? "{}");
    if (raw?.intro && typeof raw.intro === "object") intro = raw.intro;
  } catch {
    /* missing source remains unknown */
  }
  const startDate =
    validDate(festival.startDate) ?? validDate(intro.eventstartdate);
  const endDate = validDate(festival.endDate) ?? validDate(intro.eventenddate);
  return startDate && endDate && endDate < startDate
    ? { startDate: null, endDate: null }
    : { startDate, endDate };
}

export function explicitFree(fee: string | null | undefined): boolean {
  const text = cleanTourText(fee)?.trim();
  return !!text && /^(무료|입장\s*무료|입장료\s*(없음|무료)|free)$/i.test(text);
}

export function operatingTime(festival: {
  playTime: string | null;
  useTime: string | null;
  fee: string | null;
  source?: string;
}) {
  return (
    cleanTourText(festival.playTime) ??
    (festival.source !== "tourapi" && festival.useTime !== festival.fee
      ? cleanTourText(festival.useTime)
      : null)
  );
}
