import { competitors } from "./competitors";

export interface Signal {
  id: string;
  title: string;
  link: string;
  date: string;
  source: string;
  feedCategory: "travel" | "tech" | "startup" | "general";
  competitors: string[];
  valueChainLayers: string[];
  impact: "Critical" | "High" | "Medium";
  amadeusThreat: string;
  description?: string;
  isStartup?: boolean;
  startupName?: string;
}

// --- TRAVEL-FIRST keyword system ---
const strongTravelPhrases = [
  "travel tech", "travel startup", "travel industry", "travel booking",
  "travel agent", "travel distribution", "travel payment", "travel fintech",
  "airline booking", "hotel booking", "flight search", "flight booking",
  "hotel search", "trip planning", "trip planner", "travel planning",
  "travel ai", "travel chatbot", "travel assistant", "travel platform",
  "online travel", "corporate travel", "business travel", "leisure travel",
  "ndc", "new distribution capability", "global distribution system",
  "gds", "ota", "online travel agency", "meta-search", "metasearch",
  "travel management", "travel experience", "traveler", "traveller",
  "hospitality tech", "hotel tech", "airline tech", "aviation tech",
  "airport", "cruise", "car rental", "ride hailing", "mobility",
  "ancillary revenue", "dynamic pricing", "revenue management",
  "passenger", "air travel", "travel marketplace",
  "amadeus", "sabre", "travelport", "booking.com", "expedia",
  "tripadvisor", "kayak", "skyscanner", "hopper", "kiwi.com",
  "phocuswright", "skift",
];

const weakTravelWords = [
  "travel", "booking", "airline", "hotel", "flight", "reservation",
  "itinerary", "accommodation", "tourism", "destination",
];

const disruptionKeywords = [
  "ai", "artificial intelligence", "llm", "chatbot", "agent", "agentic",
  "gpt", "gemini", "copilot", "machine learning", "automation",
  "generative", "disrupt", "startup", "series a", "series b",
  "seed funding", "venture capital", "raised", "funding round",
  "launch", "acquire", "partnership", "integrate",
];

// REJECT list — skip entirely
const rejectPatterns = [
  "headphone", "earbuds", "beats studio", "speaker review",
  "smart home", "smart display",
  "gaming", "console", "playstation", "xbox", "nintendo",
  "tiktok dance", "instagram reel",
  "cryptocurrency mining", "bitcoin price", "nft drop",
  "recipe", "cooking", "kitchen appliance",
  "smartphone review", "phone case", "tablet review",
  "movie review", "tv show review", "netflix series", "streaming war",
  "fitness tracker", "smartwatch review",
];

// --- Amadeus threat assessment (context-aware) ---
const amadeusThreatRules: { pattern: RegExp; threat: string }[] = [
  { pattern: /bypass.*(gds|distribution|amadeus)/i, threat: "Direct GDS bypass — threatens core distribution revenue" },
  { pattern: /direct.*(book|connect|api).*(airline|hotel|supplier)/i, threat: "Direct supplier connections reduce GDS dependency — fewer bookings through Amadeus" },
  { pattern: /(ai|chatbot|agent).*(book|reserv|checkout)/i, threat: "AI-powered booking could disintermediate traditional GDS — travelers skip Amadeus-powered channels" },
  { pattern: /google.*(flight|hotel|travel|book|ai mode)/i, threat: "Google building native travel booking in AI Mode — captures demand before it reaches GDS-powered OTAs" },
  { pattern: /openai.*(travel|flight|hotel|book|checkout)/i, threat: "ChatGPT as travel channel — transaction capabilities would bypass GDS entirely" },
  { pattern: /apple.*(travel|flight|hotel|map|pay)/i, threat: "Apple ecosystem (Maps + Pay + Siri) could create closed travel discovery-to-payment loop outside GDS" },
  { pattern: /amazon.*(travel|flight|hotel|prime)/i, threat: "Amazon's customer base could enable new travel distribution channel bypassing GDS" },
  { pattern: /meta.*(travel|flight|hotel|book)/i, threat: "Social commerce for travel — Meta's ad platform could drive direct supplier bookings, skipping GDS" },
  { pattern: /(revolut|fintech).*(travel|book|flight|hotel|swifty)/i, threat: "Fintech-owned booking + payments stack eliminates need for Amadeus in the transaction chain" },
  { pattern: /(payment|wallet|fintech|checkout).*(travel|book)/i, threat: "Alternative payment rails weaken Amadeus Payments — BSP/ARC settlement model at risk" },
  { pattern: /(startup|raise|fund|seed|series).*(travel|book|flight|hotel|gds)/i, threat: "New entrant building modern alternative to GDS infrastructure — long-term disintermediation risk" },
  { pattern: /(startup|raise|fund|seed|series).*(airline|aviation)/i, threat: "Airline tech startup helping carriers distribute directly, reducing GDS reliance" },
  { pattern: /(startup|raise|fund|seed|series).*(hotel|hospitality)/i, threat: "Hospitality tech startup building direct distribution — hotels already incentivize GDS-free bookings" },
  { pattern: /(ndc|new distribution|offer.?order)/i, threat: "NDC adoption accelerates — airlines moving to direct retail, core threat to GDS model" },
  { pattern: /(super.?app|embedded).*(travel|book)/i, threat: "Super-app travel bypasses traditional distribution — closed ecosystem with no GDS role" },
  { pattern: /(sabre).*(launch|partner|upgrade|ai|win)/i, threat: "Direct GDS competitor Sabre gaining capabilities — risk of customer migration from Amadeus" },
  { pattern: /(travelport).*(launch|partner|upgrade|ai|win)/i, threat: "Travelport modernization competes for same agency customers — Amadeus must defend share" },
  { pattern: /(personali|recommend|dynamic pricing).*(travel|trip|flight|hotel)/i, threat: "If AI personalization happens outside GDS, Amadeus loses its merchandising and retailing role" },
  { pattern: /(corporate travel|tmc|expense).*(ai|automat|disrupt|platform)/i, threat: "Threat to Amadeus Cytric and corporate travel tech — TMCs adopting non-Amadeus solutions" },
  { pattern: /(cancel|refund|rebook|disruption).*(ai|automat|bot)/i, threat: "AI-automated servicing could commoditize Amadeus post-booking products" },
  { pattern: /booking\.com.*(ai|launch|partner|direct)/i, threat: "Amadeus's largest OTA customer investing in AI to reduce GDS dependency" },
  { pattern: /expedia.*(ai|launch|partner|direct)/i, threat: "Major OTA customer building AI capabilities that could reduce Amadeus search/booking volume" },
  { pattern: /(cruise|car rental|mobility).*(ai|platform|tech)/i, threat: "Non-air travel tech evolving independently — Amadeus ground/cruise segments at risk" },
  { pattern: /(ancillary|upsell|bundle).*(ai|automat|platform)/i, threat: "If ancillary merchandising moves to supplier-side AI, Amadeus loses retailing revenue" },
];

function assessAmadeusThreat(text: string, competitorIds: string[], layers: string[]): string {
  for (const rule of amadeusThreatRules) {
    if (rule.pattern.test(text)) return rule.threat;
  }
  // Context-aware fallback based on competitor + value chain
  if (competitorIds.length > 0) {
    if (layers.includes("Booking")) return "Competitor activity in booking layer — could reduce transaction volume through Amadeus GDS";
    if (layers.includes("Discovery")) return "Building travel discovery capabilities — threatens demand reaching Amadeus-powered channels";
    if (layers.includes("Payments")) return "Travel payments activity — alternative rails that bypass Amadeus settlement infrastructure";
    if (layers.includes("Aggregation")) return "Aggregating travel content independently — reduces supplier need for GDS distribution";
    if (layers.includes("Servicing")) return "Automating post-booking services — commoditizes Amadeus servicing products";
  }
  if (layers.includes("Booking")) return "Shift in how travel transactions are processed — booking channel that may not use GDS";
  if (layers.includes("Discovery")) return "Evolution of how travelers discover options — upstream disruption before GDS-powered shopping";
  if (layers.includes("Payments")) return "New payment infrastructure for travel — may bypass Amadeus Payments division";
  return "Emerging travel tech signal — may indicate shifting competitive dynamics for GDS providers";
}

// --- Value Chain Classification ---
export const valueChainLayers = [
  "Discovery", "Aggregation", "Booking", "Settlement", "Servicing", "Payments",
] as const;

export type ValueChainLayer = (typeof valueChainLayers)[number];

const valueChainKeywords: Record<string, string[]> = {
  Discovery: ["search", "discover", "find", "plan", "inspire", "recommend", "personali", "meta-search", "metasearch", "compare"],
  Aggregation: ["aggregate", "gds", "inventory", "ndc", "content", "normalize", "api connect", "distribution", "supplier"],
  Booking: ["book", "checkout", "reserve", "purchase", "transaction", "conversion", "cart", "confirmation"],
  Settlement: ["settle", "bsp", "arc", "clearing", "reconcil", "merchant of record", "revenue"],
  Servicing: ["cancel", "refund", "rebook", "disrupt", "customer service", "support", "rebooking", "duty of care"],
  Payments: ["payment", "pay", "wallet", "fintech", "bnpl", "credit card", "revolut", "stripe"],
};

// --- Startup detection ---
const startupIndicators = [
  "startup", "founded", "raises", "raised", "seed round", "series a",
  "series b", "series c", "pre-seed", "incubator", "accelerator",
  "y combinator", "techstars", "venture", "angel investor",
  "early-stage", "growth stage", "funding round", "venture capital",
  "backed by", "million funding", "new platform", "launch",
];

function detectStartup(text: string, title: string): { isStartup: boolean; name?: string } {
  const lower = text.toLowerCase();
  const isStartup = startupIndicators.some((kw) => lower.includes(kw));
  if (!isStartup) return { isStartup: false };
  const match = title.match(/^([A-Z][a-zA-Z0-9\s.]+?)(?:\s+(?:raises|launches|announces|secures|closes|gets|receives|lands))/);
  return { isStartup: true, name: match?.[1]?.trim() };
}

function extractSource(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace("www.", "").split(".")[0];
  } catch {
    return "unknown";
  }
}

// --- Classification Logic ---
export function classifySignal(item: {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  source?: string;
  feedCategory?: "travel" | "tech" | "startup" | "general";
}): Signal | null {
  const text = `${item.title} ${item.description || ""} ${item.content || ""}`.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const feedCategory = item.feedCategory || "general";

  // STEP 1: Reject obvious irrelevant content
  if (rejectPatterns.some((p) => titleLower.includes(p))) return null;

  // STEP 2: Check travel relevance strength
  const hasStrongTravel = strongTravelPhrases.some((p) => text.includes(p));
  const hasWeakTravel = weakTravelWords.some((kw) => text.includes(kw));
  const hasDisruption = disruptionKeywords.some((kw) => text.includes(kw));

  // STEP 3: Check competitor mentions — TITLE ONLY + WORD BOUNDARY matching
  // Uses regex word boundaries to prevent "revolut" matching "revolutionize",
  // "booking" matching "rebooking", etc.
  const matchedCompetitors = competitors.filter((c) =>
    c.keywords.some((kw) => {
      const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(item.title);
    })
  );

  // STEP 4: Relevance decision
  const isTravelFeed = feedCategory === "travel";
  const isStartupFeed = feedCategory === "startup";

  let isRelevant = false;

  if (isTravelFeed) {
    // Travel feed: inherently relevant, just needs tech/disruption angle
    isRelevant = hasDisruption || matchedCompetitors.length > 0;
  } else if (isStartupFeed) {
    // Startup feed: needs travel connection
    isRelevant = hasStrongTravel || (hasWeakTravel && hasDisruption);
  } else {
    // Tech/general feeds: need STRONG travel signal
    if (hasStrongTravel) {
      isRelevant = true;
    } else if (hasWeakTravel && hasDisruption && matchedCompetitors.length > 0) {
      isRelevant = true;
    }
    // No travel context at all? Reject, even if competitor mentioned.
  }

  if (!isRelevant) return null;

  // STEP 5: Classify value chain layers
  const layers: string[] = [];
  for (const [layer, keywords] of Object.entries(valueChainKeywords)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      layers.push(layer);
    }
  }
  if (layers.length === 0 && matchedCompetitors.length > 0) {
    const s = new Set<string>();
    matchedCompetitors.forEach((c) => c.valueChainTarget.forEach((l) => s.add(l)));
    layers.push(...s);
  }
  if (layers.length === 0) layers.push("General");

  // STEP 6: Assess impact
  const criticalTerms = ["disrupt", "replace", "bypass", "eliminate", "existential", "acquire", "agentic booking"];
  const highTerms = ["partner", "integrate", "expand", "fund", "invest", "scale", "raise", "series", "launch"];
  const hasCritical = criticalTerms.some((t) => text.includes(t));
  const hasHigh = highTerms.some((t) => text.includes(t));
  const impact = hasCritical ? "Critical" : hasHigh ? "High" : "Medium";

  // STEP 7: Amadeus threat (context-aware)
  const fullText = `${item.title} ${item.description || ""}`;
  const competitorIds = matchedCompetitors.map((c) => c.id);
  const amadeusThreat = assessAmadeusThreat(fullText, competitorIds, layers);

  // STEP 8: Detect startup
  const startupInfo = detectStartup(text, item.title);

  const id = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);

  return {
    id,
    title: item.title,
    link: item.link || "",
    date: item.pubDate || new Date().toISOString(),
    source: item.source || extractSource(item.link || ""),
    feedCategory,
    competitors: matchedCompetitors.map((c) => c.id),
    valueChainLayers: layers,
    impact,
    amadeusThreat,
    description: item.description?.replace(/<[^>]+>/g, "").slice(0, 300),
    isStartup: startupInfo.isStartup,
    startupName: startupInfo.name,
  };
}

// --- Deduplication ---
export function deduplicateSignals(signals: Signal[]): Signal[] {
  const seen = new Map<string, Signal>();
  for (const signal of signals) {
    const key = signal.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (!seen.has(key)) {
      seen.set(key, signal);
    } else {
      const existing = seen.get(key)!;
      if (signal.competitors.length > existing.competitors.length) seen.set(key, signal);
    }
  }
  return Array.from(seen.values());
}

// --- Baseline Signals ---
export const baselineSignals: Signal[] = [
  { id: "google-agentic-flight-hotel-booking", title: "Google announces agentic flight and hotel booking in AI Mode", date: "2025-11-17", source: "Skift", feedCategory: "travel", competitors: ["google"], valueChainLayers: ["Discovery", "Booking"], impact: "Critical", amadeusThreat: "AI-powered booking could disintermediate traditional GDS workflow", link: "https://skift.com/2025/11/17/google-is-building-agentic-travel-booking/" },
  { id: "openai-abandons-checkout", title: "OpenAI abandons in-chat checkout, shifts to discovery only", date: "2026-03-05", source: "Skift", feedCategory: "travel", competitors: ["openai"], valueChainLayers: ["Booking"], impact: "Critical", amadeusThreat: "Reduces immediate booking threat but reinforces AI discovery channel", link: "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/" },
  { id: "revolut-acquires-swifty", title: "Revolut acquires Swifty AI travel agent from Lufthansa Innovation Hub", date: "2025-10-15", source: "FinTech Futures", feedCategory: "travel", competitors: ["revolut"], valueChainLayers: ["Booking", "Payments"], impact: "Critical", amadeusThreat: "Fintech building full-stack travel booking + payments", link: "https://www.fintechfutures.com/m-a/revolut-acquires-ai-travel-assistant-swiftly" },
  { id: "revolut-pay-booking-com", title: "Revolut Pay integrated with Booking.com as largest travel partner", date: "2025-11-17", source: "FinTech Futures", feedCategory: "travel", competitors: ["revolut", "booking"], valueChainLayers: ["Payments"], impact: "High", amadeusThreat: "Alternative payment rails could bypass Amadeus Payments division", link: "https://www.fintechfutures.com/partnerships/revolut-partners-booking-com/" },
  { id: "chatgpt-expedia-booking-apps", title: "ChatGPT launches apps with Expedia and Booking.com", date: "2025-10-06", source: "PhocusWire", feedCategory: "travel", competitors: ["openai", "expedia", "booking"], valueChainLayers: ["Discovery", "Booking"], impact: "High", amadeusThreat: "AI discovery layer partnering with OTAs — could reduce GDS search traffic", link: "https://www.phocuswire.com/openai-chatgpt-apps-expedia-booking-tripadvisor" },
  { id: "google-flight-deals-ai-200-countries", title: "Google Flight Deals AI tool expanded to 200+ countries", date: "2025-11-17", source: "TechCrunch", feedCategory: "tech", competitors: ["google"], valueChainLayers: ["Discovery"], impact: "High", amadeusThreat: "Big tech entry into travel discovery threatens Amadeus-powered channels", link: "https://techcrunch.com/2025/11/17/google-rolls-out-its-ai-flight-deals-tool-globally/" },
  { id: "pichai-2026-consumers-use-all-this", title: "Pichai frames 2026 as year consumers 'actually use all of this'", date: "2026-02-05", source: "Skift", feedCategory: "travel", competitors: ["google"], valueChainLayers: ["Discovery", "Booking"], impact: "Critical", amadeusThreat: "Google AI push into consumer travel accelerates disintermediation timeline", link: "https://skift.com/2026/02/04/google-earnings-ai-search-q4-2025-travel/" },
  { id: "revolut-titan-corporate-card", title: "Revolut announces Titan premium card for corporate travel", date: "2025-12-11", source: "American Banker", feedCategory: "travel", competitors: ["revolut"], valueChainLayers: ["Payments"], impact: "High", amadeusThreat: "Fintech entering corporate travel payments — competes with Amadeus Cytric", link: "https://www.americanbanker.com/payments/news/revolut-plans-premium-card-for-corporate-travel" },
  { id: "stripe-openai-instant-checkout", title: "Stripe and OpenAI launch Instant Checkout in ChatGPT", date: "2025-09-01", source: "TTG Asia", feedCategory: "tech", competitors: ["stripe", "openai"], valueChainLayers: ["Payments", "Booking"], impact: "High", amadeusThreat: "Alternative payment rails could bypass Amadeus Payments division", link: "" },
  { id: "booking-holdings-google-ai-mode", title: "Booking Holdings partners with Google AI Mode for flight/hotel booking", date: "2025-11-20", source: "Skift", feedCategory: "travel", competitors: ["booking", "google"], valueChainLayers: ["Aggregation", "Booking"], impact: "High", amadeusThreat: "Amadeus biggest customer reducing GDS dependency via Google AI", link: "https://skift.com/2025/11/20/google-agentic-ai-travel-booking-no-intention-become-ota/" },
  { id: "expedia-shares-jump-openai-retreat", title: "Expedia Group shares jump 12% on OpenAI checkout retreat", date: "2026-03-05", source: "The Silicon Review", feedCategory: "travel", competitors: ["expedia", "openai"], valueChainLayers: ["Booking"], impact: "High", amadeusThreat: "Market validates AI booking threat was real — may resume later", link: "" },
  { id: "google-no-intention-ota", title: "Google clarifies: 'No intention of becoming an OTA'", date: "2025-11-20", source: "Skift", feedCategory: "travel", competitors: ["google"], valueChainLayers: ["Settlement"], impact: "Medium", amadeusThreat: "Signal to monitor — may indicate evolving competitive landscape", link: "https://skift.com/2025/11/20/google-agentic-ai-travel-booking-no-intention-become-ota/" },

  // --- STARTUP BASELINE DATA ---
  { id: "hopper-series-f", title: "Hopper raises $96M in Series F, valued at $5B, expands AI price prediction", date: "2025-08-14", source: "TechCrunch", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery", "Booking"], impact: "Critical", amadeusThreat: "AI-native OTA with price prediction bypasses GDS shopping — direct supplier deals", link: "", isStartup: true, startupName: "Hopper" },
  { id: "navan-series-g", title: "Navan (formerly TripActions) raises $150M at $9.4B valuation for corporate travel AI", date: "2025-10-02", source: "Skift", feedCategory: "startup", competitors: [], valueChainLayers: ["Booking", "Servicing"], impact: "Critical", amadeusThreat: "Threat to Amadeus Cytric and corporate travel tech — TMCs adopting non-Amadeus solutions", link: "", isStartup: true, startupName: "Navan" },
  { id: "spotnana-series-c", title: "Spotnana raises $75M Series C to rebuild corporate travel infrastructure from scratch", date: "2025-09-20", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Booking", "Servicing"], impact: "Critical", amadeusThreat: "Direct GDS alternative for corporate travel — modern API-first platform replacing legacy systems", link: "", isStartup: true, startupName: "Spotnana" },
  { id: "mindtrip-series-a", title: "Mindtrip raises $17M Series A for AI-powered trip planning platform", date: "2025-11-08", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery"], impact: "High", amadeusThreat: "AI trip planner that curates from multiple sources — upstream disruption before GDS", link: "", isStartup: true, startupName: "Mindtrip" },
  { id: "layla-seed", title: "Layla raises $8.3M seed round for conversational AI travel agent", date: "2025-07-22", source: "TechCrunch", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery", "Booking"], impact: "High", amadeusThreat: "AI travel agent connecting directly to suppliers — may not need GDS at all", link: "", isStartup: true, startupName: "Layla" },
  { id: "journera-series-b", title: "Journera raises $11M to connect traveler data across airlines, hotels, and agencies", date: "2025-06-15", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Servicing"], impact: "High", amadeusThreat: "Cross-industry traveler data platform could replace GDS as the data backbone", link: "", isStartup: true, startupName: "Journera" },
  { id: "flyr-series-c", title: "FLYR raises $150M Series C for AI airline revenue management platform", date: "2025-05-10", source: "Skift", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Booking"], impact: "Critical", amadeusThreat: "AI-native revenue management competes with Amadeus Altéa revenue tools", link: "", isStartup: true, startupName: "FLYR" },
  { id: "kiwi-ai-agent", title: "Kiwi.com launches AI booking agent with virtual interlining for complex itineraries", date: "2025-12-03", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Booking"], impact: "High", amadeusThreat: "Virtual interlining aggregates without GDS — alternative content sourcing", link: "", isStartup: true, startupName: "Kiwi.com" },
  { id: "tripscout-series-a", title: "TripScout raises $10M to build AI destination discovery platform for Gen Z travelers", date: "2025-09-14", source: "TechCrunch", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery"], impact: "Medium", amadeusThreat: "Social-first discovery platform bypasses traditional search and GDS", link: "", isStartup: true, startupName: "TripScout" },
  { id: "duffel-series-b", title: "Duffel raises $41M Series B to modernize airline distribution APIs", date: "2025-04-22", source: "TechCrunch", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Booking"], impact: "Critical", amadeusThreat: "Direct GDS competitor — modern API layer for airline content that replaces legacy GDS connections", link: "", isStartup: true, startupName: "Duffel" },
  { id: "gordian-series-b", title: "Gordian Software raises $30M to power airline ancillary merchandising via APIs", date: "2025-08-30", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Booking", "Aggregation"], impact: "High", amadeusThreat: "If ancillary merchandising moves to supplier-side APIs, Amadeus loses retailing revenue", link: "", isStartup: true, startupName: "Gordian Software" },
  { id: "impala-hotels-api", title: "Impala raises $25M to build universal hotel connectivity API — alternative to GDS", date: "2025-07-18", source: "Skift", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation"], impact: "Critical", amadeusThreat: "Direct GDS alternative for hotel distribution — aggregates without legacy middleware", link: "", isStartup: true, startupName: "Impala" },
  { id: "troop-travel-corporate", title: "Troop Travel raises $12M for AI corporate travel planning with sustainability scoring", date: "2025-11-25", source: "EU-Startups", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery", "Booking"], impact: "High", amadeusThreat: "Corporate travel planning tool that doesn't depend on Amadeus Cytric", link: "", isStartup: true, startupName: "Troop Travel" },
  { id: "roam-around-seed", title: "Roam Around raises $5M to build GPT-powered itinerary generator", date: "2025-06-08", source: "TechCrunch", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery"], impact: "Medium", amadeusThreat: "AI itinerary tools create upstream disruption — travelers plan outside GDS channels", link: "", isStartup: true, startupName: "Roam Around" },
  { id: "turneo-series-a", title: "Turneo raises $8M Series A for AI-powered hotel experience platform", date: "2025-10-20", source: "EU-Startups", feedCategory: "startup", competitors: [], valueChainLayers: ["Servicing", "Discovery"], impact: "Medium", amadeusThreat: "Hotel tech building direct guest engagement — reduces need for GDS in hotel servicing", link: "", isStartup: true, startupName: "Turneo" },
  { id: "between-series-a", title: "Between raises $7.5M to automate group travel booking with AI", date: "2025-08-05", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Booking", "Aggregation"], impact: "High", amadeusThreat: "Group travel automation outside traditional TMC/GDS workflow", link: "", isStartup: true, startupName: "Between" },
  { id: "priceline-vip-ai", title: "Priceline partner Penny AI raises $12M to power hotel search with conversational AI", date: "2025-09-28", source: "Skift", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery", "Booking"], impact: "High", amadeusThreat: "Conversational hotel search could bypass traditional GDS-powered metasearch", link: "", isStartup: true, startupName: "Penny AI" },
  { id: "ratepunk-seed", title: "RatePunk raises $3M to build browser extension that finds hidden hotel deals", date: "2025-07-01", source: "EU-Startups", feedCategory: "startup", competitors: [], valueChainLayers: ["Discovery", "Booking"], impact: "Medium", amadeusThreat: "Price comparison tools that work outside GDS — direct supplier scraping", link: "", isStartup: true, startupName: "RatePunk" },
  { id: "nezasa-series-b", title: "Nezasa raises $20M for multi-day trip packaging platform used by tour operators", date: "2025-05-18", source: "PhocusWire", feedCategory: "startup", competitors: [], valueChainLayers: ["Aggregation", "Booking"], impact: "High", amadeusThreat: "Tour packaging platform with own aggregation — competes with Amadeus tour/activity solutions", link: "", isStartup: true, startupName: "Nezasa" },
  { id: "aci-blue-smart", title: "ACI blueSmart raises $15M for AI-driven airport ops platform adopted by 30+ airports", date: "2025-11-12", source: "Phocuswright", feedCategory: "startup", competitors: [], valueChainLayers: ["Servicing"], impact: "High", amadeusThreat: "Airport operations AI competes with Amadeus Airport IT solutions", link: "", isStartup: true, startupName: "ACI blueSmart" },
];

// --- Market Trend Detection ---
export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  signalCount: number;
  signals: Signal[];
  valueChainLayers: string[];
  competitorIds: string[];
  velocity: "Accelerating" | "Stable" | "Emerging";
  amadeusThreat: string;
}

const trendPatterns: { id: string; name: string; keywords: string[]; description: string; amadeusThreat: string }[] = [
  { id: "ai-booking-agents", name: "AI-Powered Booking Agents", keywords: ["agentic", "ai agent", "booking agent", "chatbot booking", "ai assistant book", "operator"], description: "AI systems that can autonomously search, compare, and complete travel bookings", amadeusThreat: "Could bypass GDS entirely if AI agents connect directly to supplier APIs" },
  { id: "big-tech-travel-entry", name: "Big Tech Entering Travel", keywords: ["google travel", "google flight", "apple travel", "amazon travel", "ai mode", "google ai"], description: "Major tech platforms building native travel discovery and booking features", amadeusThreat: "Aggregation at the platform level threatens GDS relevance in shopping/discovery" },
  { id: "fintech-travel-convergence", name: "Fintech-Travel Convergence", keywords: ["revolut travel", "fintech travel", "travel payment", "embedded finance", "bnpl travel", "super-app travel", "revolut pay"], description: "Financial services companies embedding travel booking within payment platforms", amadeusThreat: "Alternative payment + booking rails that don't need Amadeus infrastructure" },
  { id: "ndc-adoption", name: "NDC Acceleration", keywords: ["ndc", "new distribution capability", "direct connect", "airline retail", "offer and order"], description: "Airlines shifting to NDC for direct distribution, reducing GDS dependency", amadeusThreat: "Core threat to GDS business model — airlines distributing content directly" },
  { id: "ai-personalization", name: "AI-Driven Personalization", keywords: ["personali", "recommend", "tailor", "dynamic pricing", "revenue management", "ai pricing"], description: "Machine learning enabling hyper-personalized travel offers and pricing", amadeusThreat: "If personalization happens outside GDS, Amadeus loses merchandising role" },
  { id: "travel-startup-wave", name: "Travel Tech Startup Wave", keywords: ["startup", "raises", "funding", "series a", "series b", "seed", "venture", "founded", "incubat"], description: "New startups building AI-native alternatives to incumbent travel tech", amadeusThreat: "New entrants building ground-up alternatives without legacy GDS integration" },
  { id: "voice-multimodal", name: "Voice & Multimodal Travel", keywords: ["voice", "siri travel", "alexa travel", "multimodal", "visual search", "ar travel"], description: "Non-text interfaces for travel discovery — voice assistants, visual search, AR", amadeusThreat: "New discovery interfaces that may not route through traditional search/GDS" },
  { id: "corporate-travel-disruption", name: "Corporate Travel Disruption", keywords: ["corporate travel", "business travel", "tmc", "travel management", "expense", "cytric"], description: "AI tools and fintech disrupting corporate travel management and expense", amadeusThreat: "Direct threat to Amadeus Cytric and TMC technology solutions" },
  { id: "china-apac-super-apps", name: "APAC Super-App Expansion", keywords: ["super-app", "grab", "wechat", "paytm", "gojek", "apac travel", "southeast asia travel"], description: "Asian super-apps expanding travel features and entering new markets", amadeusThreat: "Closed ecosystems that bypass traditional distribution in high-growth markets" },
  { id: "post-booking-ai", name: "AI in Post-Booking Services", keywords: ["cancel", "rebooking", "customer service ai", "chatbot support", "disruption management", "duty of care"], description: "AI automating post-booking services: changes, cancellations, disruption management", amadeusThreat: "Amadeus services like disruption management could be commoditized by AI" },
];

export function detectTrends(signals: Signal[]): MarketTrend[] {
  return trendPatterns
    .map((pattern) => {
      const matchingSignals = signals.filter((s) => {
        const text = `${s.title} ${s.description || ""}`.toLowerCase();
        return pattern.keywords.some((kw) => text.includes(kw));
      });
      if (matchingSignals.length === 0) return null;

      const now = new Date();
      const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      const recent = matchingSignals.filter((s) => new Date(s.date) >= fifteenDaysAgo).length;
      const older = matchingSignals.length - recent;
      const velocity = recent > older + 1 ? "Accelerating" : matchingSignals.length <= 2 ? "Emerging" : "Stable";

      const allLayers = new Set<string>();
      const allCompetitors = new Set<string>();
      matchingSignals.forEach((s) => {
        s.valueChainLayers.forEach((l) => allLayers.add(l));
        s.competitors.forEach((c) => allCompetitors.add(c));
      });

      return {
        id: pattern.id, name: pattern.name, description: pattern.description,
        signalCount: matchingSignals.length,
        signals: matchingSignals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        valueChainLayers: Array.from(allLayers), competitorIds: Array.from(allCompetitors),
        velocity, amadeusThreat: pattern.amadeusThreat,
      };
    })
    .filter((t): t is MarketTrend => t !== null)
    .sort((a, b) => b.signalCount - a.signalCount);
}
