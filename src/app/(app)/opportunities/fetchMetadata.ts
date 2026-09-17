"use server";

// Best-effort autofill from a pasted grant/competition URL: fetches the page
// and pulls whatever a normal webpage already exposes for link previews
// (title, description, site name) plus a couple of regex heuristics for a
// deadline and an award/fee amount. This is pattern-matching over arbitrary
// third-party HTML, not real understanding of the page -- it fills fields
// so there's less to type, but every field it returns should still be
// treated as a guess to check, not a fact.
export type OpportunityMetadata = {
  name: string | null;
  organization: string | null;
  deadline: string | null; // yyyy-mm-dd
  awardAmount: number | null;
  feeAmount: number | null;
};

function isPrivateOrLocalHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (/^127\.|^10\.|^192\.168\.|^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (h === "0.0.0.0" || h === "[::1]") return true;
  return false;
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, attr: "property" | "name", key: string) {
  const re = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const reReversed = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i");
  const match = html.match(re) ?? html.match(reReversed);
  return match ? decodeEntities(match[1]).trim() : null;
}

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";

function findDeadline(text: string): string | null {
  const keywordWindow = /(?:deadline|due date|due by|closes|closing date|applications? due)[^.]{0,60}/gi;
  const windows = text.match(keywordWindow) ?? [];
  const searchIn = windows.length > 0 ? windows.join(" ") : text;

  const monthFirst = new RegExp(`(${MONTHS})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i");
  const m1 = searchIn.match(monthFirst);
  if (m1) {
    const d = new Date(`${m1[1]} ${m1[2]}, ${m1[3]}`);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  const slashDate = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const m2 = searchIn.match(slashDate);
  if (m2) {
    const [, mo, day, yr] = m2;
    const d = new Date(Number(yr), Number(mo) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  return null;
}

function findAmount(text: string, keywords: RegExp): number | null {
  const keywordWindow = new RegExp(`${keywords.source}[^.]{0,40}`, "gi");
  const windows = text.match(keywordWindow) ?? [];
  const searchIn = windows.join(" ");
  const m = searchIn.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

export async function fetchOpportunityMetadataFromUrl(url: string): Promise<OpportunityMetadata | { error: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: "That doesn't look like a valid URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Only http/https links are supported." };
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    return { error: "That URL can't be fetched." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let html: string;
  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ArtistDashboardBot/1.0; +https://sanyu-artist-crm.netlify.app)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return { error: `The page returned an error (${res.status}).` };
    const reader = res.body?.getReader();
    if (!reader) {
      html = await res.text();
    } else {
      const chunks: Uint8Array[] = [];
      let total = 0;
      const MAX_BYTES = 2_000_000;
      while (total < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
      }
      html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
    }
  } catch {
    return { error: "Couldn't reach that URL. Check the link and try again." };
  } finally {
    clearTimeout(timeout);
  }

  const titleTag = html.match(/<title>([^<]*)<\/title>/i);
  const name = metaContent(html, "property", "og:title") ?? (titleTag ? decodeEntities(titleTag[1]).trim() : null);
  const organization = metaContent(html, "property", "og:site_name") ?? parsed.hostname.replace(/^www\./, "");
  const description = metaContent(html, "property", "og:description") ?? metaContent(html, "name", "description") ?? "";

  const plainText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const searchText = `${description} ${plainText}`;

  return {
    name,
    organization,
    deadline: findDeadline(searchText),
    awardAmount: findAmount(searchText, /(?:award|grant amount|prize|stipend|funding)/i),
    feeAmount: findAmount(searchText, /(?:application fee|entry fee|submission fee)/i),
  };
}
