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

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  mdash: "-",
  ndash: "-",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(s: string) {
  return s.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code[0] === "#") {
      const codePoint = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[code] ?? match;
  });
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
        // A generic bot UA gets blanket-blocked by a lot of ordinary sites'
        // WAFs (anything with "bot" in it, basically). This is fetching one
        // page on behalf of one signed-in user clicking one button, not
        // crawling -- a normal browser UA reflects that more honestly than
        // it looks like it would.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (res.status === 403 || res.status === 999) {
      return { error: "That site is blocking automated requests. You'll need to fill this one in by hand." };
    }
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
