const HTML_TAG_REGEX = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g;
const WHITESPACE_REGEX = /\s+/g;
const URL_REGEX = /https?:\/\/[^\s"'<>]+/i;

export function cleanTourText(value: string | null | undefined): string | null {
  if (!value) return null;

  const text = decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(HTML_TAG_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(WHITESPACE_REGEX, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return text.length > 0 ? text : null;
}

export function extractFirstUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const decoded = decodeHtmlEntities(value);
  const href = decoded.match(/href=["']([^"']+)["']/i)?.[1];
  const candidate = href ?? decoded.match(URL_REGEX)?.[0];
  return normalizeUrl(candidate);
}

export function toParagraphs(value: string | null | undefined): string[] {
  const clean = cleanTourText(value);
  if (!clean) return [];
  return clean.split(/\n{2,}/).filter(Boolean);
}

export function extractTourIntroProgram(
  rawJson: string | null | undefined,
): string | null {
  if (!rawJson) return null;

  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!isRecord(parsed) || !isRecord(parsed.intro)) return null;
    if (typeof parsed.intro.program !== "string") return null;

    return cleanTourText(formatProgramText(parsed.intro.program));
  } catch {
    return null;
  }
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/[),.]+$/, "");
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function formatProgramText(value: string): string {
  return value
    .replace(
      /([^\s])([1-9]\.\s*(?:메인|부대|체험|참여|공연|기타|대표|주제|문화|지역|소비자))/g,
      "$1\n$2",
    )
    .replace(/([^\s])(\[[^\]\n]{2,30}\])/g, "$1\n$2");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
