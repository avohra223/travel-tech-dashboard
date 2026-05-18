import { NextResponse } from "next/server";
import type { SeedStartup } from "@/lib/seedImport";

// YC's Algolia search endpoint and public search-only key are extracted from
// the JS embedded in https://www.ycombinator.com/companies. The key is
// secured (it's restricted via tag filters to the ycdc_public scope) so it's
// safe to embed in this server-side route. If YC rotates it, this route
// returns 502 and we'll need to refetch from their page.
const APP_ID = "45BWZJ1SGC";
const SEARCH_KEY =
  "NzllNTY5MzJiZGM2OTY2ZTQwMDEzOTNhYWZiZGRjODlhYzVkNjBmOGRjNzJiMWM4ZTU0ZDlhYTZjOTJiMjlhMWFuYWx5dGljc1RhZ3M9eWNkYyZyZXN0cmljdEluZGljZXM9WUNDb21wYW55X3Byb2R1Y3Rpb24lMkNZQ0NvbXBhbnlfQnlfTGF1bmNoX0RhdGVfcHJvZHVjdGlvbiZ0YWdGaWx0ZXJzPSU1QiUyMnljZGNfcHVibGljJTIyJTVE";
const INDEX = "YCCompany_production";

interface AlgoliaHit {
  name?: string;
  one_liner?: string;
  long_description?: string;
  website?: string;
  batch?: string;
  status?: string;
  industries?: string[];
  subindustry?: string;
  tags?: string[];
  all_locations?: string;
  stage?: string;
}

// Map "San Francisco, CA, USA" → "USA"; "London, United Kingdom" → "UK"
function extractCountry(loc: string | undefined): string {
  if (!loc) return "";
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  const last = parts[parts.length - 1];
  const map: Record<string, string> = {
    "United States": "USA",
    "United States of America": "USA",
    "US": "USA",
    "U.S.": "USA",
    "United Kingdom": "UK",
    "Great Britain": "UK",
    "GB": "UK",
  };
  return map[last] || last;
}

// Infer sub-category from YC's industry/tag taxonomy, matching the
// sub-categories used by startupRepository.ts so the UI groups them cleanly.
function inferSubCategory(hit: AlgoliaHit): string {
  const tags = (hit.tags || []).map((t) => t.toLowerCase());
  const subind = (hit.subindustry || "").toLowerCase();
  const inds = (hit.industries || []).map((i) => i.toLowerCase());

  if (tags.includes("airlines") || inds.some((i) => i.includes("aviation"))) return "Airline Tech";
  if (tags.includes("hotels") || tags.includes("hospitality")) return "Hotel & Hospitality Tech";
  if (tags.includes("fintech") && tags.includes("travel")) return "Travel Fintech";
  if (tags.includes("payments")) return "Travel Fintech";
  if (tags.includes("ai assistant") || (tags.includes("artificial intelligence") && tags.includes("travel"))) return "AI Travel Assistants";
  if (tags.includes("marketplace")) return "Booking & Marketplace";
  if (tags.includes("logistics") || tags.includes("transportation")) return "Airport & Ground Tech";
  if (tags.includes("b2b") && tags.includes("travel")) return "Distribution & APIs";
  if (tags.includes("real estate") || subind.includes("real estate")) return "Vacation Rental";
  if (subind.includes("travel, leisure and tourism")) return "Booking & Marketplace";
  return "Other Travel Tech";
}

// Best-guess value chain layers based on sub-category — matches the
// six-layer model from valueChainLayers in signals.ts.
function inferValueChain(subCategory: string): string[] {
  const map: Record<string, string[]> = {
    "Airline Tech": ["Aggregation", "Booking"],
    "Hotel & Hospitality Tech": ["Aggregation", "Servicing"],
    "Travel Fintech": ["Payments"],
    "AI Travel Assistants": ["Discovery"],
    "Booking & Marketplace": ["Discovery", "Booking"],
    "Airport & Ground Tech": ["Servicing"],
    "Distribution & APIs": ["Aggregation"],
    "Vacation Rental": ["Servicing"],
  };
  return map[subCategory] || ["Discovery", "Booking"];
}

function hitToSeed(hit: AlgoliaHit): SeedStartup {
  const subCategory = inferSubCategory(hit);
  const description =
    (hit.one_liner || hit.long_description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200) || `YC company in ${subCategory}`;
  return {
    name: hit.name || "Unknown",
    hq: extractCountry(hit.all_locations),
    subCategory,
    valueChain: inferValueChain(subCategory),
    funding: hit.batch ? `YC ${hit.batch}` : "Undisclosed",
    description,
    website: hit.website || "",
  };
}

export async function GET() {
  try {
    const res = await fetch(
      `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}/query`,
      {
        method: "POST",
        headers: {
          "X-Algolia-Application-Id": APP_ID,
          "X-Algolia-API-Key": SEARCH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "",
          hitsPerPage: 1000,
          facetFilters: [["tags:Travel"]],
          attributesToRetrieve: [
            "name",
            "one_liner",
            "long_description",
            "website",
            "batch",
            "status",
            "industries",
            "subindustry",
            "tags",
            "all_locations",
            "stage",
          ],
        }),
        // Algolia is fast; even 5s is generous
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Algolia returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { hits?: AlgoliaHit[]; nbHits?: number };
    const hits = data.hits || [];
    // Exclude inactive (dead/acquired) companies if status is marked Dead;
    // keep "Acquired" and "Public" since they're still real signals.
    const filtered = hits.filter((h) => (h.status || "").toLowerCase() !== "dead");
    const seeds = filtered.map(hitToSeed).filter((s) => s.name && s.name !== "Unknown");

    return NextResponse.json({
      source: "Y Combinator",
      totalAvailable: data.nbHits ?? hits.length,
      excluded: hits.length - filtered.length,
      entries: seeds,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch from YC: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
