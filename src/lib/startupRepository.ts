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
  hq: string;
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

// --- Cities and countries for rejection + HQ extraction ---
const cities = [
  "amsterdam", "prague", "berlin", "london", "paris", "barcelona", "madrid",
  "lisbon", "dublin", "munich", "zurich", "stockholm", "oslo", "copenhagen",
  "helsinki", "vienna", "brussels", "rome", "milan", "warsaw", "budapest",
  "bucharest", "athens", "istanbul", "dubai", "abu dhabi", "riyadh", "doha",
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune", "kolkata",
  "singapore", "hong kong", "tokyo", "seoul", "shanghai", "beijing",
  "shenzhen", "guangzhou", "taipei", "bangkok", "jakarta", "kuala lumpur",
  "manila", "ho chi minh", "hanoi", "sydney", "melbourne", "auckland",
  "new york", "san francisco", "los angeles", "seattle", "boston", "chicago",
  "austin", "denver", "miami", "atlanta", "toronto", "vancouver", "montreal",
  "mexico city", "sao paulo", "rio de janeiro", "bogota", "buenos aires",
  "santiago", "lima", "cape town", "johannesburg", "nairobi", "lagos",
  "cairo", "tel aviv", "haifa", "tallinn", "riga", "vilnius", "krakow",
  "porto", "florence", "lyon", "marseille", "hamburg", "frankfurt",
  "dusseldorf", "edinburgh", "manchester", "birmingham", "leeds", "bristol",
  "glasgow", "belfast", "cardiff", "nottingham", "sheffield", "liverpool",
];

const countries = [
  "usa", "us", "uk", "india", "china", "japan", "south korea", "germany",
  "france", "spain", "italy", "netherlands", "sweden", "norway", "denmark",
  "finland", "switzerland", "austria", "belgium", "portugal", "ireland",
  "poland", "czech republic", "hungary", "romania", "greece", "turkey",
  "israel", "uae", "saudi arabia", "qatar", "bahrain", "oman", "kuwait",
  "singapore", "malaysia", "thailand", "vietnam", "indonesia", "philippines",
  "australia", "new zealand", "canada", "mexico", "brazil", "colombia",
  "argentina", "chile", "peru", "south africa", "nigeria", "kenya", "egypt",
  "estonia", "latvia", "lithuania", "croatia", "serbia", "bulgaria",
  "ukraine", "russia", "taiwan", "hong kong",
];

const cityToCountry: Record<string, string> = {
  "amsterdam": "Netherlands", "prague": "Czech Republic", "berlin": "Germany",
  "london": "UK", "paris": "France", "barcelona": "Spain", "madrid": "Spain",
  "lisbon": "Portugal", "dublin": "Ireland", "munich": "Germany",
  "zurich": "Switzerland", "stockholm": "Sweden", "oslo": "Norway",
  "copenhagen": "Denmark", "helsinki": "Finland", "vienna": "Austria",
  "brussels": "Belgium", "rome": "Italy", "milan": "Italy",
  "warsaw": "Poland", "budapest": "Hungary", "bucharest": "Romania",
  "athens": "Greece", "istanbul": "Turkey", "dubai": "UAE",
  "abu dhabi": "UAE", "riyadh": "Saudi Arabia", "doha": "Qatar",
  "mumbai": "India", "delhi": "India", "bangalore": "India",
  "hyderabad": "India", "chennai": "India", "pune": "India",
  "singapore": "Singapore", "hong kong": "Hong Kong", "tokyo": "Japan",
  "seoul": "South Korea", "shanghai": "China", "beijing": "China",
  "taipei": "Taiwan", "bangkok": "Thailand", "jakarta": "Indonesia",
  "kuala lumpur": "Malaysia", "manila": "Philippines",
  "sydney": "Australia", "melbourne": "Australia", "auckland": "New Zealand",
  "new york": "USA", "san francisco": "USA", "los angeles": "USA",
  "seattle": "USA", "boston": "USA", "chicago": "USA", "austin": "USA",
  "denver": "USA", "miami": "USA", "atlanta": "USA",
  "toronto": "Canada", "vancouver": "Canada", "montreal": "Canada",
  "mexico city": "Mexico", "sao paulo": "Brazil", "bogota": "Colombia",
  "buenos aires": "Argentina", "tel aviv": "Israel", "haifa": "Israel",
  "tallinn": "Estonia", "riga": "Latvia", "vilnius": "Lithuania",
  "krakow": "Poland", "porto": "Portugal", "hamburg": "Germany",
  "frankfurt": "Germany", "edinburgh": "UK", "manchester": "UK",
  "cape town": "South Africa", "nairobi": "Kenya", "lagos": "Nigeria",
  "cairo": "Egypt", "lyon": "France",
};

const knownHQ: Record<string, string> = {
  "Hopper": "Canada", "Navan": "USA", "Spotnana": "USA", "Mindtrip": "USA",
  "Layla": "USA", "Journera": "USA", "FLYR": "USA", "Kiwi.com": "Czech Republic",
  "Duffel": "UK", "Gordian Software": "USA", "Impala": "UK",
  "Troop Travel": "Spain", "Turneo": "Germany", "RatePunk": "Lithuania",
  "Nezasa": "Switzerland", "TravelPerk": "Spain", "Uplift": "USA",
  "GetYourGuide": "Germany", "Duve": "Israel", "OYO": "India",
  "Cleartrip": "India", "Ixigo": "India", "MakeMyTrip": "India",
  "Traveloka": "Indonesia", "Klook": "Hong Kong", "Hotelbeds": "Spain",
  "Sonder": "USA", "Selina": "Israel", "Vacasa": "USA",
  "Cloudbeds": "USA", "Mews": "Czech Republic", "Apaleo": "Germany",
  "Guesty": "Israel", "Hostaway": "Finland", "SiteMinder": "Australia",
  "RateGain": "India", "Flutterwave": "Nigeria", "WeTravel": "USA",
  "Blacklane": "Germany", "Fetcherr": "Israel", "Peek": "USA",
  "Viator": "USA", "Tiqets": "Netherlands", "Headout": "USA",
  "Hostelworld": "Ireland", "Culture Trip": "UK",
  "Welcome Pickups": "Greece", "Kyte": "USA",
};

// Extract HQ location from signal text
function extractHQ(name: string, text: string): string {
  // Check known HQ first
  if (knownHQ[name]) return knownHQ[name];

  const lower = text.toLowerCase();

  // Pattern: "city-based" or "based in city"
  for (const city of cities) {
    if (lower.includes(`${city}-based`) || lower.includes(`based in ${city}`)) {
      return cityToCountry[city] || city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  // Pattern: "headquartered in city"
  for (const city of cities) {
    if (lower.includes(`headquartered in ${city}`) || lower.includes(`hq in ${city}`)) {
      return cityToCountry[city] || city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  // Pattern: mentions a country directly like "Indian startup" or "Israeli company"
  const nationalityMap: Record<string, string> = {
    "indian": "India", "israeli": "Israel", "dutch": "Netherlands",
    "german": "Germany", "french": "France", "spanish": "Spain",
    "british": "UK", "american": "USA", "canadian": "Canada",
    "australian": "Australia", "japanese": "Japan", "chinese": "China",
    "korean": "South Korea", "brazilian": "Brazil", "mexican": "Mexico",
    "turkish": "Turkey", "indonesian": "Indonesia", "thai": "Thailand",
    "vietnamese": "Vietnam", "malaysian": "Malaysia", "singaporean": "Singapore",
    "nigerian": "Nigeria", "south african": "South Africa", "egyptian": "Egypt",
    "saudi": "Saudi Arabia", "emirati": "UAE", "estonian": "Estonia",
    "latvian": "Latvia", "lithuanian": "Lithuania", "polish": "Poland",
    "czech": "Czech Republic", "swedish": "Sweden", "norwegian": "Norway",
    "danish": "Denmark", "finnish": "Finland", "swiss": "Switzerland",
    "irish": "Ireland", "portuguese": "Portugal", "italian": "Italy",
    "greek": "Greece", "colombian": "Colombia", "chilean": "Chile",
    "peruvian": "Peru", "argentine": "Argentina",
  };
  for (const [adj, country] of Object.entries(nationalityMap)) {
    if (lower.includes(adj)) return country;
  }

  return "";
}

// Clean startup name — remove prefixes and reject bad names
function cleanStartupName(name: string): string {
  let cleaned = name
    // Remove "city/country-based" prefixes
    .replace(/^[A-Za-z\s]+-based\s+/i, "")
    // Remove country/region adjective prefixes
    .replace(/^(Dutch|Indian|Israeli|UK-based|US-based|Berlin-based|London-based|Paris-based|Singapore-based|European|Asia-based|China-based|Brazilian|Chinese|Japanese|Korean|Thai|Vietnamese|Indonesian|Malaysian|Filipino|Australian|Canadian|French|German|Spanish|Italian|Swiss|Swedish|Norwegian|Danish|Finnish|Irish|Scottish|Turkish|Egyptian|Saudi|Emirati|South African|Nigerian|Kenyan|Mexican|Colombian|Argentine|Chilean|Peruvian|Ukrainian|Latin American?|SA|UAE|Hong Kong|New Zealand|Southeast Asian|Czech|Estonian|Latvian|Lithuanian|Polish|Greek|Portuguese|Hungarian|Romanian|Bulgarian|Croatian|Serbian)\s+/i, "")
    // Remove descriptor prefixes
    .replace(/^(startup|travel tech|hotel tech|airline tech|fintech|traveltech firm|travel startup|hotel startup|airline startup|travel company|tech startup|AI startup|travel AI|Indian travel fintech firm|Traveltech firm|travel platform|company|platform|app|VC|venture|corporate travel|hospitality)\s+/i, "")
    // Second pass for remaining generic prefixes
    .replace(/^(travel|tech|startup|company|platform|firm|venture)\s+/i, "")
    .replace(/\s*[-–|:].+$/, "") // Remove everything after dash/colon
    .replace(/\s*\(.+\)$/, "") // Remove parenthetical
    .trim();

  // Reject if it still looks like a sentence or generic term
  const words = cleaned.split(/\s+/);
  if (words.length > 5) return "";
  if (/^[a-z]/.test(cleaned)) return "";

  const sentenceWords = ["is", "are", "was", "were", "has", "have", "had", "will", "would", "could", "should", "that", "this", "with", "from", "but", "not"];
  const sentenceWordCount = sentenceWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(cleaned)).length;
  if (sentenceWordCount >= 2) return "";

  // Reject cities, countries, and generic words
  const lowerCleaned = cleaned.toLowerCase();
  if (cities.includes(lowerCleaned)) return "";
  if (countries.includes(lowerCleaned)) return "";

  const rejectList = [
    "latin america", "asia", "europe", "africa", "middle east", "crypto",
    "travel", "hotel", "airline", "payment", "startup", "vc", "ai", "tech",
    "the", "new", "global", "world", "international", "digital", "smart",
    "stage", "video", "interview", "analysis", "opinion", "report",
    "exclusive", "breaking", "update", "review", "podcast", "webinar",
    "startup stage", "hot 25", "ones to watch", "watch", "listen",
    "feature", "sponsored", "special", "phocuswire", "skift",
    "gen z", "gen-z",
    "cloud", "data", "online", "mobile", "next", "open", "fast", "easy",
    "one", "pro", "top", "best", "first", "big", "small", "free",
    "south", "north", "east", "west", "central",
  ];
  if (rejectList.includes(lowerCleaned)) return "";

  return cleaned;
}

// Guess website from startup name
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
  const actionVerbs = "raises|raised|launches|launched|announces|announced|secures|secured|closes|closed|gets|receives|received|lands|landed|expands|expanded|partners|partnered|unveils|unveiled|debuts|debuted|acquires|acquired|snags|valued|nabs|bags|wins|won|rolls out|introduces|pivots|enters|opens|hits|reaches|reports|helps|lets|seeks|wants|aims|offers|brings|connects|enables|simplifies|streamlines|automates|transforms|disrupts|delivers|provides|builds|creates|makes|turns|uses|integrates|drives";

  // Article prefixes to strip before name extraction
  const articlePrefixes = /^(STARTUP STAGE|VIDEO|INTERVIEW|ANALYSIS|OPINION|REPORT|EXCLUSIVE|BREAKING|UPDATE|REVIEW|PODCAST|WEBINAR|SPONSORED|SPECIAL|FEATURE|HOT 25|ONES TO WATCH|WATCH|LISTEN)\s*:\s*/i;

  for (const s of startupSignals) {
    if (!s.startupName) {
      // Strip article prefixes first
      let title = s.title.replace(articlePrefixes, "").trim();
      // Also strip source suffixes like " - PhocusWire"
      title = title.replace(/\s*[-–—]\s*(PhocusWire|Skift|TechCrunch|The Verge|Ars Technica|Phocuswright|Travel And Tour World|Travel Weekly).*$/i, "").trim();

      const patterns = [
        new RegExp(`^([A-Z][a-zA-Z0-9\\s.&'-]+?)\\s+(?:${actionVerbs})`),
        new RegExp(`^([A-Z][a-zA-Z0-9.]+)\\s*[,:]`),
        new RegExp(`(?:startup|company|platform|app)\\s+([A-Z][a-zA-Z0-9.]+)`, "i"),
      ];
      for (const pattern of patterns) {
        const match = title.match(pattern);
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
    const rawDesc = sorted[0].description || sorted[0].title;
    const desc = rawDesc.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const threat =
      sorted.find((s) => s.amadeusThreat && !s.amadeusThreat.includes("Emerging travel tech"))
        ?.amadeusThreat || sorted[0].amadeusThreat;
    const hq = extractHQ(name, allText);

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
      hq,
    });
  }

  return profiles.sort((a, b) => {
    const aVal = parseFloat(a.totalFunding.replace(/[^0-9.]/g, "")) || 0;
    const bVal = parseFloat(b.totalFunding.replace(/[^0-9.]/g, "")) || 0;
    if (bVal !== aVal) return bVal - aVal;
    return b.signalCount - a.signalCount;
  });
}
