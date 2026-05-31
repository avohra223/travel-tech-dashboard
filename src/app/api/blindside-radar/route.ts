import { NextRequest, NextResponse } from "next/server";

// Blindside Radar — given a (typically non-travel) company URL, surface that
// company's travel-tech-related news over the last year, bucketed by recency.
//
// Strategy: we don't crawl the open web (unreliable + not legal at scale).
// Instead we query Google News search (which already indexes the whole web's
// news, free, no API key) for "<Company> + travel keywords" scoped to the last
// year, then filter, dedupe, and bucket by date server-side.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRAVEL_KEYWORDS = [
  "travel",
  "airline",
  "airlines",
  "flight",
  "flights",
  "airfare",
  "hotel",
  "hotels",
  "booking",
  "bookings",
  "trip",
  "trips",
  "tourism",
  "tourist",
  "hospitality",
  "vacation",
  "holiday",
  "airport",
  "aviation",
  "itinerary",
  "lodging",
  "ota", // online travel agency
  "gds", // global distribution system
  "ndc", // new distribution capability
  "expedia",
  "booking.com",
  "tripadvisor",
  "airbnb",
];

// The travel keyword cluster used to constrain the Google News query.
const QUERY_TRAVEL_CLAUSE =
  "(travel OR airline OR flights OR hotel OR booking OR trip OR tourism OR hospitality OR vacation OR airport OR aviation)";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  isoDate: string;
  ageDays: number;
  relevance: number;
  matchedKeywords: string[];
}

// -- HTML entity decode (minimal, covers what Google News emits) -------------
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .trim();
}

// -- Derive a clean company name from a URL ----------------------------------
// First tries to read the homepage's og:site_name / <title>; falls back to the
// domain root word. Returns both a display name and the search token list.
async function resolveCompany(rawUrl: string): Promise<{
  name: string;
  domain: string;
  tokens: string[];
}> {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;

  let domain = "";
  try {
    domain = new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    domain = normalized.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }

  // Domain-derived fallback name: take the registrable label before the TLD.
  const domainParts = domain.split(".");
  const fallbackLabel =
    domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domainParts[0];
  const fallbackName = fallbackLabel
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let name = fallbackName;

  try {
    const res = await fetch(normalized, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (res.ok) {
      const html = (await res.text()).slice(0, 60000);
      const ogSite =
        html.match(
          /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
        )?.[1] ||
        html.match(
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i
        )?.[1];
      const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

      let candidate = (ogSite || titleTag || "").trim();
      candidate = decodeEntities(candidate);
      // Titles are often "Brand | Tagline" or "Brand - Official Site". Keep the
      // most name-like segment (usually the first).
      if (candidate) {
        candidate = candidate
          .split(/\s*[|–—:·•]\s*|\s+-\s+/)[0]
          .replace(/\b(home|official site|homepage|welcome to)\b/gi, "")
          .trim();
        if (candidate.length >= 2 && candidate.length <= 60) name = candidate;
      }
    }
  } catch {
    // Homepage blocked or slow — fall back to domain-derived name.
  }

  // Search tokens: distinctive words from the name (len > 2), lowercased.
  const stop = new Set(["the", "inc", "ltd", "llc", "corp", "company", "group", "co"]);
  const tokens = Array.from(
    new Set(
      name
        .toLowerCase()
        .split(/[^a-z0-9.]+/)
        .filter((t) => t.length > 2 && !stop.has(t))
    )
  );
  if (tokens.length === 0) tokens.push(fallbackLabel.toLowerCase());

  return { name, domain, tokens };
}

// -- Parse Google News RSS into items ----------------------------------------
function parseGoogleNews(xml: string): Array<{
  title: string;
  link: string;
  pubDate: string;
  source: string;
}> {
  const out: Array<{ title: string; link: string; pubDate: string; source: string }> = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const block of itemBlocks) {
    const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
    const source = decodeEntities(
      block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || ""
    );
    let title = decodeEntities(rawTitle);
    // Google News appends " - Publisher" to titles; strip it if it matches.
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3)).trim();
    } else {
      const idx = title.lastIndexOf(" - ");
      if (idx > 20) title = title.slice(0, idx).trim();
    }
    if (title && link) out.push({ title, link, pubDate, source });
  }
  return out;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const company = await resolveCompany(url);

    // Build the Google News query: company name + travel cluster, last year.
    const query = `"${company.name}" ${QUERY_TRAVEL_CLAUSE} when:1y`;
    const gnUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
      query
    )}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(gnUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `News search returned ${res.status}` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const raw = parseGoogleNews(xml);

    const now = Date.now();
    const seen = new Set<string>();
    const items: NewsItem[] = [];

    for (const r of raw) {
      const t = new Date(r.pubDate);
      if (isNaN(t.getTime())) continue;
      const ageDays = Math.floor((now - t.getTime()) / 86400000);
      if (ageDays < 0 || ageDays > 366) continue;

      const haystack = `${r.title} ${r.source}`.toLowerCase();

      // Hard requirement: at least one travel keyword present.
      const matched = TRAVEL_KEYWORDS.filter((k) => haystack.includes(k));
      if (matched.length === 0) continue;

      // Soft signal: does the company actually appear? Boosts relevance + sort.
      const companyPresent = company.tokens.some((tok) => haystack.includes(tok));

      // Dedupe by normalized title.
      const key = r.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        title: r.title,
        link: r.link,
        source: r.source || "Google News",
        isoDate: t.toISOString(),
        ageDays,
        relevance: matched.length * 2 + (companyPresent ? 3 : 0),
        matchedKeywords: matched.slice(0, 6),
      });
    }

    // Newest first.
    items.sort((a, b) => a.ageDays - b.ageDays);

    const counts = {
      d30: items.filter((i) => i.ageDays <= 30).length,
      d120: items.filter((i) => i.ageDays <= 120).length,
      d180: items.filter((i) => i.ageDays <= 180).length,
      d365: items.length,
    };

    return NextResponse.json({
      company: company.name,
      domain: company.domain,
      query,
      total: items.length,
      counts,
      items,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Scan failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
