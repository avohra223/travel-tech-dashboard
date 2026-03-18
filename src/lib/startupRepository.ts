import type { Signal } from "./signals";

export interface StartupProfile {
  name: string;
  slug: string;
  description: string;
  totalFunding: string;
  latestRound: string;
  valueChainTargets: string[];
  subCategory: string;
  signalCount: number;
  signals: Signal[];
  firstSeen: string;
  lastSeen: string;
  amadeusThreat: string;
  website: string;
}

// Sub-categories for startups
const subCategoryRules: { keywords: string[]; category: string }[] = [
  { keywords: ["corporate travel", "business travel", "tmc", "expense", "navan", "spotnana", "troop"], category: "Corporate Travel Tech" },
  { keywords: ["airline", "aviation", "flight", "flyr", "duffel", "gordian", "ndc", "ancillary"], category: "Airline Tech" },
  { keywords: ["hotel", "hospitality", "accommodation", "impala", "turneo", "lodging"], category: "Hotel & Hospitality Tech" },
  { keywords: ["payment", "fintech", "checkout", "wallet", "bnpl"], category: "Travel Fintech" },
  { keywords: ["ai agent", "chatbot", "conversational", "trip plan", "itinerary", "layla", "mindtrip", "roam"], category: "AI Travel Assistants" },
  { keywords: ["booking", "ota", "marketplace", "hopper", "kiwi", "between", "nezasa"], category: "Booking & Marketplace" },
  { keywords: ["data", "analytics", "journera", "personali", "recommend"], category: "Travel Data & Analytics" },
  { keywords: ["airport", "ground", "mobility", "car rental", "aci", "bluesmart"], category: "Airport & Ground Tech" },
  { keywords: ["search", "discovery", "compare", "meta", "ratepunk", "tripscout", "penny"], category: "Search & Discovery" },
  { keywords: ["api", "connect", "distribut", "aggregat"], category: "Distribution & APIs" },
];

function detectSubCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const rule of subCategoryRules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.category;
  }
  return "Other Travel Tech";
}

// Extract funding amount from text
function extractFunding(text: string): { total: string; latest: string } {
  const lower = text.toLowerCase();

  // Match patterns like "$96M", "$150 million", "€25M"
  const amounts: { value: number; text: string }[] = [];
  const regex = /[\$€£]?\s*(\d+(?:\.\d+)?)\s*(?:m(?:illion)?|b(?:illion)?)/gi;
  let match;
  while ((match = regex.exec(lower)) !== null) {
    const num = parseFloat(match[1]);
    const isBillion = /b(?:illion)?/i.test(match[0]);
    amounts.push({
      value: isBillion ? num * 1000 : num,
      text: `$${isBillion ? num + "B" : num + "M"}`,
    });
  }

  if (amounts.length === 0) return { total: "Undisclosed", latest: "Undisclosed" };

  const largest = amounts.sort((a, b) => b.value - a.value)[0];
  return { total: largest.text, latest: largest.text };
}

// Clean startup name — remove prefixes and reject bad names
function cleanStartupName(name: string): string {
  let cleaned = name
    // Remove country/region prefixes
    .replace(/^(Dutch|Indian|Israeli|UK-based|US-based|Berlin-based|London-based|Paris-based|Singapore-based|European|Asia-based|China-based|Brazilian|Chinese|Japanese|Korean|Thai|Vietnamese|Indonesian|Malaysian|Filipino|Australian|Canadian|French|German|Spanish|Italian|Swiss|Swedish|Norwegian|Danish|Finnish|Irish|Scottish|Turkish|Egyptian|Saudi|Emirati|South African|Nigerian|Kenyan|Mexican|Colombian|Argentine|Chilean|Peruvian|Ukrainian|Latin American?|SA|UAE|Hong Kong|New Zealand|Southeast Asian)\s+/i, "")
    // Remove descriptor prefixes
    .replace(/^(startup|travel tech|hotel tech|airline tech|fintech|traveltech firm|travel startup|hotel startup|airline startup|travel company|tech startup|AI startup|travel AI|Indian travel fintech firm|Traveltech firm|travel platform|company|platform|app|VC|venture|corporate travel|hospitality)\s+/i, "")
    // Second pass for compound prefixes like "SA travel startup TurnStay"
    .replace(/^(travel|tech|startup|company|platform|firm|venture)\s+/i, "")
    .replace(/\s*[-–|:].+$/, "") // Remove everything after dash/colon (subtitle)
    .replace(/\s*\(.+\)$/, "") // Remove parenthetical
    .trim();

  // Reject if it still looks like a sentence or generic term
  const words = cleaned.split(/\s+/);
  if (words.length > 5) return ""; // Too many words = sentence, not a name
  if (/^[a-z]/.test(cleaned)) return ""; // Starts lowercase = not a proper name
  // Reject sentences with multiple articles/verbs (but allow company names with "and")
  const sentenceWords = ["is", "are", "was", "were", "has", "have", "had", "will", "would", "could", "should", "that", "this", "with", "from", "but", "not"];
  const sentenceWordCount = sentenceWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(cleaned)).length;
  if (sentenceWordCount >= 2) return ""; // Multiple sentence words = definitely a sentence

  // Reject generic words that aren't company names
  const rejectList = ["Latin America", "Asia", "Europe", "Africa", "Middle East", "Crypto", "Travel", "Hotel", "Airline", "Payment", "Startup", "VC", "AI", "Tech", "The", "New", "Global", "World", "International"];
  if (rejectList.some((r) => cleaned.toLowerCase() === r.toLowerCase())) return "";

  return cleaned;
}

// Guess website from startup name — comprehensive lookup + auto-generation
function guessWebsite(name: string): string {
  const known: Record<string, string> = {
    "Hopper": "https://hopper.com",
    "Navan": "https://navan.com",
    "Spotnana": "https://spotnana.com",
    "Mindtrip": "https://mindtrip.ai",
    "Layla": "https://justlayla.com",
    "Journera": "https://journera.com",
    "FLYR": "https://flyr.com",
    "Kiwi.com": "https://kiwi.com",
    "TripScout": "https://tripscout.co",
    "Duffel": "https://duffel.com",
    "Gordian Software": "https://gordiansoftware.com",
    "Impala": "https://impala.travel",
    "Troop Travel": "https://trooptravel.com",
    "Roam Around": "https://roamaround.io",
    "Turneo": "https://turneo.com",
    "Between": "https://between.co",
    "Penny AI": "https://pennytravel.ai",
    "RatePunk": "https://ratepunk.com",
    "Nezasa": "https://nezasa.com",
    "ACI blueSmart": "https://aci.aero",
    "TravelPerk": "https://travelperk.com",
    "Uplift": "https://uplift.com",
    "GetYourGuide": "https://getyourguide.com",
    "Duve": "https://duve.com",
    "OYO": "https://oyorooms.com",
    "Cleartrip": "https://cleartrip.com",
    "Ixigo": "https://ixigo.com",
    "MakeMyTrip": "https://makemytrip.com",
    "Traveloka": "https://traveloka.com",
    "Klook": "https://klook.com",
    "TripActions": "https://navan.com",
    "Hotelbeds": "https://hotelbeds.com",
    "Sonder": "https://sonder.com",
    "Selina": "https://selina.com",
    "Autocamp": "https://autocamp.com",
    "Vacasa": "https://vacasa.com",
    "Cloudbeds": "https://cloudbeds.com",
    "Mews": "https://mews.com",
    "Apaleo": "https://apaleo.com",
    "Guesty": "https://guesty.com",
    "Hostaway": "https://hostaway.com",
    "SiteMinder": "https://siteminder.com",
    "RateGain": "https://rategain.com",
    "OTA Insight": "https://otainsight.com",
    "Hotelogix": "https://hotelogix.com",
    "Stayntouch": "https://stayntouch.com",
    "Amadeus": "https://amadeus.com",
    "Flutterwave": "https://flutterwave.com",
    "WeTravel": "https://wetravel.com",
    "TripAdmit": "https://tripadmit.com",
    "Tramada": "https://tramada.com",
    "Winding Tree": "https://windingtree.com",
    "Kyte": "https://kyte.com",
    "Blacklane": "https://blacklane.com",
    "Welcome Pickups": "https://welcomepickups.com",
    "Fetcherr": "https://fetcherr.io",
    "Volaris": "https://volaris.com",
    "Easygo": "https://easygo.com",
    "Peek": "https://peek.com",
    "Viator": "https://viator.com",
    "Musement": "https://musement.com",
    "Tiqets": "https://tiqets.com",
    "Headout": "https://headout.com",
    "Hostelworld": "https://hostelworld.com",
    "Culture Trip": "https://theculturetrip.com",
  };

  if (known[name]) return known[name];

  // Auto-generate: convert name to likely domain
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (slug.length >= 3 && slug.length <= 20) {
    return `https://${slug}.com`;
  }
  return "";
}

export function buildStartupRepository(signals: Signal[]): StartupProfile[] {
  const startupSignals = signals.filter(
    (s) => s.isStartup || s.feedCategory === "startup"
  );

  // Group by startup name
  const byName = new Map<string, Signal[]>();

  for (const s of startupSignals) {
    if (s.startupName) {
      const name = cleanStartupName(s.startupName);
      if (name.length > 2) {
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(s);
      }
    }
  }

  // Also try to extract names from signals without startupName
  const actionVerbs = "raises|raised|launches|launched|announces|announced|secures|secured|closes|closed|gets|receives|received|lands|landed|expands|expanded|partners|partnered|unveils|unveiled|debuts|debuted|acquires|acquired|snags|valued|nabs|bags|wins|won|rolls out|introduces|pivots|enters|opens|hits|reaches|reports";
  for (const s of startupSignals) {
    if (!s.startupName) {
      // Try multiple patterns
      const patterns = [
        new RegExp(`^([A-Z][a-zA-Z0-9\\s.&'-]+?)\\s+(?:${actionVerbs})`),
        new RegExp(`^([A-Z][a-zA-Z0-9.]+)\\s*[,:]`),  // "CompanyName, the..."
        new RegExp(`(?:startup|company|platform|app)\\s+([A-Z][a-zA-Z0-9.]+)`, "i"),
      ];
      for (const pattern of patterns) {
        const match = s.title.match(pattern);
        if (match) {
          const name = cleanStartupName(match[1].trim());
          if (name.length > 2 && name.length < 35) {
            if (!byName.has(name)) byName.set(name, []);
            byName.get(name)!.push(s);
            break;
          }
        }
      }
    }
  }

  // Build profiles
  const profiles: StartupProfile[] = [];

  for (const [name, sigs] of byName) {
    const sorted = sigs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const allText = sigs.map((s) => `${s.title} ${s.description || ""}`).join(" ");

    const funding = extractFunding(allText);
    const allLayers = new Set<string>();
    sigs.forEach((s) => s.valueChainLayers.forEach((l) => allLayers.add(l)));

    const subCategory = detectSubCategory(`${name} ${allText}`);

    // Pick best description from signals
    const desc =
      sorted[0].description ||
      sorted[0].title;

    // Pick most specific amadeusThreat
    const threat =
      sorted.find((s) => s.amadeusThreat && !s.amadeusThreat.includes("Emerging travel tech"))
        ?.amadeusThreat || sorted[0].amadeusThreat;

    profiles.push({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: desc.slice(0, 200),
      totalFunding: funding.total,
      latestRound: funding.latest,
      valueChainTargets: Array.from(allLayers),
      subCategory,
      signalCount: sigs.length,
      signals: sorted,
      firstSeen: sorted[sorted.length - 1].date,
      lastSeen: sorted[0].date,
      amadeusThreat: threat,
      website: guessWebsite(name),
    });
  }

  // Sort by funding amount (descending), then by signal count
  return profiles.sort((a, b) => {
    const aVal = parseFloat(a.totalFunding.replace(/[^0-9.]/g, "")) || 0;
    const bVal = parseFloat(b.totalFunding.replace(/[^0-9.]/g, "")) || 0;
    if (bVal !== aVal) return bVal - aVal;
    return b.signalCount - a.signalCount;
  });
}
