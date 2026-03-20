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
  let cleaned = name.trim();

  // --- PATTERN: "descriptor startup/platform ActualName" → extract ActualName ---
  // Handles: "SaaS startup TravelPerk", "Hotel procurement startup Reeco",
  // "Barcelona unicorn TravelPerk", "Boutique hotel tech platform NUMA",
  // "Online travel marketplace Evaneos", "AI travel startup Visio Trip",
  // "Corporate guest travel startup Juno", "TravelTech platform GeniusTravel"
  const extractLast = cleaned.match(
    /(?:startup|platform|company|firm|unicorn|marketplace|venture|tool|app|service|solution|provider)\s+([A-Z][a-zA-Z0-9.\-&' ]{1,30})$/i
  );
  if (extractLast) {
    cleaned = extractLast[1].trim();
  }

  // Strip "VC " prefix (e.g., "VC GHARAGE" → "GHARAGE")
  cleaned = cleaned.replace(/^VC\s+/i, "");

  // --- Standard prefix stripping ---
  cleaned = cleaned
    // Remove "city/country-based" prefixes
    .replace(/^[A-Za-z\s]+-based\s+/i, "")
    // Remove nationality/region adjective prefixes (comprehensive)
    .replace(/^(Dutch|Indian|Israeli|UK|US|Brazilian|Chinese|Japanese|Korean|Thai|Vietnamese|Indonesian|Malaysian|Filipino|Australian|Canadian|French|German|Spanish|Italian|Swiss|Swedish|Norwegian|Danish|Finnish|Irish|Scottish|Turkish|Egyptian|Saudi|Emirati|South African|Nigerian|Kenyan|Mexican|Colombian|Argentine|Chilean|Peruvian|Ukrainian|Czech|Estonian|Latvian|Lithuanian|Polish|Greek|Portuguese|Hungarian|Romanian|Bulgarian|Croatian|Serbian|European|Southeast Asian|Latin American|Austrian|South Korean|New Zealand|Barcelona|London|Berlin|Paris|Amsterdam|Prague|Tel Aviv|Singapore|Hong Kong|Dubai|Boutique|Online|Corporate|Sustainable|Parametric|SaaS)\s+/i, "")
    // Remove descriptor words (multi-pass)
    .replace(/^(startup|travel\s*tech|hotel\s*tech|airline\s*tech|fintech|traveltech|travel|hotel|airline|tech|AI|robotics|hospitality|business|corporate|guest|procurement|sustainable|boutique|online|digital|smart|SaaS|B2B|B2C)\s+/gi, "")
    .replace(/^(startup|platform|company|firm|unicorn|marketplace|venture|tool|app|service|solution|provider)\s+/gi, "")
    // One more pass for stubborn prefixes
    .replace(/^(startup|travel|tech|hotel|AI|platform|company|firm)\s+/gi, "")
    .replace(/\s*[-–|:].+$/, "") // Remove everything after dash/colon
    .replace(/\s*\(.+\)$/, "") // Remove parenthetical
    .replace(/\s+co$/i, "") // Remove trailing "co" as in "Ele.me co"
    .replace(/\s+Technology Solutions$/i, "") // "Hopper Technology Solutions" → "Hopper"
    .replace(/\s+Ventures$/i, "") // "GHARAGE Ventures" → "GHARAGE"
    .trim();

  // Reject if it still looks like a sentence or generic term
  const words = cleaned.split(/\s+/);
  if (words.length > 4) return "";
  if (cleaned.length < 2) return "";
  if (/^[a-z]/.test(cleaned)) return "";

  const sentenceWords = ["is", "are", "was", "were", "has", "have", "had", "will", "would", "could", "should", "that", "this", "with", "from", "but", "not", "for", "and", "the", "its"];
  const sentenceWordCount = sentenceWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(cleaned)).length;
  if (sentenceWordCount >= 2) return "";

  // Reject cities, countries, and generic words
  const lowerCleaned = cleaned.toLowerCase();
  if (cities.includes(lowerCleaned)) return "";
  if (countries.includes(lowerCleaned)) return "";

  const rejectList = [
    // Generic words that aren't startup names
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
    // Common English words that get false-matched as startup names
    "raises", "story", "just", "fly", "daily", "upgrade", "peer",
    "convoy", "nuit", "liven", "frontier", "summit", "beacon",
    "edge", "focus", "insight", "bridge", "quest", "flow", "spark",
    "point", "wave", "shift", "core", "base", "hub", "loop",
    "link", "nest", "mark", "scope", "path", "rise", "meet",
    // Known large companies (acquirers) — not startups
    "just eat", "just eat takeaway", "capital one", "mastercard", "visa",
    "american express", "jpmorgan", "goldman sachs", "morgan stanley",
    "citigroup", "barclays", "hsbc", "deutsche bank", "ubs",
    "singapore airlines", "lufthansa", "delta", "united", "emirates",
    "marriott", "hilton", "ihg", "accor", "wyndham", "hyatt",
    "uber", "lyft", "airbnb", "tripadvisor", "trip.com",
    "alibaba", "tencent", "baidu", "jd.com", "meituan",
    "robotics", "medical travel",
    // More generic English words that slip through
    "funding", "profile", "pitch", "escape", "aims", "embargo",
    "engine", "spun", "can", "gru", "apply", "scout", "atlas",
    "anchor", "launch", "track", "venture", "route", "trips",
    "wings", "miles", "stay", "check", "pass", "gate", "port",
    // Known large companies / GDS competitors / acquirers — not startups
    "sabre", "travelport", "amadeus", "booking.com", "expedia",
    "tripadvisor", "trip.com", "agoda", "kayak", "priceline",
    "skyscanner", "trivago", "momondo", "opodo", "edreams",
    "etraveli", "etraveli group", "booking holdings", "expedia group",
    "trip.com group", "travelsky", "webjet", "dnata", "farelogix",
    "lufthansa", "delta", "united airlines", "emirates", "qatar airways",
    "singapore airlines", "klarna", "revolut", "stripe", "paypal",
    "square", "block", "salesforce", "oracle", "sap", "intuit",
    "shopify", "delivery hero", "just eat takeaway",
  ];
  if (rejectList.includes(lowerCleaned)) return "";

  // Reject if starts with "The " (likely a phrase, not a name)
  if (/^The\s/i.test(cleaned) && words.length > 2) return "";

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
  const actionVerbs = "raises|raised|launches|launched|announces|announced|secures|secured|closes|closed|gets|receives|received|lands|landed|expands|expanded|partners|partnered|unveils|unveiled|debuts|debuted|snags|valued|nabs|bags|wins|won|rolls out|introduces|pivots|enters|opens|hits|reaches|reports|helps|lets|seeks|wants|aims|offers|brings|connects|enables|simplifies|streamlines|automates|transforms|disrupts|delivers|provides|builds|creates|makes|turns|uses|integrates|drives";

  // Article prefixes to strip before name extraction
  const articlePrefixes = /^(STARTUP STAGE|VIDEO|INTERVIEW|ANALYSIS|OPINION|REPORT|EXCLUSIVE|BREAKING|UPDATE|REVIEW|PODCAST|WEBINAR|SPONSORED|SPECIAL|FEATURE|HOT 25|ONES TO WATCH|WATCH|LISTEN)\s*:\s*/i;

  // Known acquirers — large companies that buy startups (extract the acquiree, not the acquirer)
  const knownAcquirers = [
    "etraveli", "booking holdings", "booking.com", "expedia", "expedia group",
    "trip.com", "trip.com group", "airbnb", "tripadvisor", "google", "amazon",
    "microsoft", "apple", "meta", "uber", "visa", "mastercard", "american express",
    "capital one", "jpmorgan", "goldman sachs", "marriott", "hilton", "ihg", "accor",
    "hyatt", "wyndham", "sabre", "amadeus", "travelport", "travelsky",
    "lufthansa", "delta", "united airlines", "emirates", "singapore airlines",
    "klarna", "revolut", "stripe", "paypal", "square", "block",
    "salesforce", "oracle", "sap", "intuit", "shopify",
    "just eat", "just eat takeaway", "delivery hero",
  ];

  for (const s of startupSignals) {
    if (!s.startupName) {
      // Strip article prefixes first
      let title = s.title.replace(articlePrefixes, "").trim();
      // Also strip source suffixes like " - PhocusWire"
      title = title.replace(/\s*[-–—]\s*(PhocusWire|Skift|TechCrunch|The Verge|Ars Technica|Phocuswright|Travel And Tour World|Travel Weekly).*$/i, "").trim();

      // --- ACQUISITION PATTERN: "X acquires/buys Y" → extract Y as startup ---
      const acquisitionMatch = title.match(
        /^(.+?)\s+(?:acquires?|acquired|buys?|bought|purchases?|purchased|snaps up|picks up|takes over|to acquire|to buy|to purchase)\s+(.+?)(?:\s+(?:for|in|to)\s+|$)/i
      );
      if (acquisitionMatch) {
        const acquirer = acquisitionMatch[1].trim().toLowerCase();
        const acquiree = acquisitionMatch[2].trim();
        // Check if the acquirer is a known large company
        const isKnownAcquirer = knownAcquirers.some((a) => acquirer.includes(a) || a.includes(acquirer));
        if (isKnownAcquirer) {
          // Extract the acquiree (the startup being acquired)
          const name = cleanStartupName(acquiree);
          if (name.length > 2 && name.length < 35) {
            if (!byName.has(name)) byName.set(name, []);
            byName.get(name)!.push(s);
            continue; // Skip other patterns — we found the startup
          }
        }
      }

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
