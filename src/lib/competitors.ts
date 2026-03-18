export interface TrackedCompetitor {
  id: string;
  name: string;
  category: string;
  threatLevel: "Critical" | "High" | "Elevated" | "Moderate" | "Low";
  keywords: string[];
  valueChainTarget: string[];
  color: string;
  implication?: string;
}

export const competitors: TrackedCompetitor[] = [
  {
    id: "google",
    name: "Google",
    category: "Big Tech",
    threatLevel: "Critical",
    keywords: ["google flights", "google travel", "google maps", "google ai mode", "google search", "google cloud travel"],
    valueChainTarget: ["Discovery", "Aggregation", "Booking"],
    color: "#EA4335",
    implication: "Google's AI Mode can disintermediate GDS by connecting travelers directly to supplier inventory. Amadeus must ensure its content appears in AI-generated search results.",
  },
  {
    id: "openai",
    name: "OpenAI / ChatGPT",
    category: "AI Native",
    threatLevel: "Elevated",
    keywords: ["openai", "chatgpt", "sam altman", "chatgpt travel", "openai travel"],
    valueChainTarget: ["Discovery", "Booking"],
    color: "#10A37F",
    implication: "ChatGPT is becoming a travel discovery channel. If it gains booking capabilities, it could bypass traditional distribution. Amadeus should explore API partnerships.",
  },
  {
    id: "revolut",
    name: "Revolut",
    category: "Fintech",
    threatLevel: "High",
    keywords: ["revolut", "swifty", "revpoints", "revolut pay", "revolut travel"],
    valueChainTarget: ["Payments", "Booking"],
    color: "#0075EB",
    implication: "Revolut is building a full-stack travel + payments experience. Their Swifty acquisition signals intent to own the booking layer. Direct threat to Amadeus payments and TMC partners.",
  },
  {
    id: "apple",
    name: "Apple",
    category: "Big Tech",
    threatLevel: "Moderate",
    keywords: ["apple travel", "apple maps travel", "apple pay travel", "siri travel", "apple intelligence travel"],
    valueChainTarget: ["Discovery", "Payments"],
    color: "#555555",
    implication: "Apple's on-device AI and Maps could become a travel discovery channel. Apple Pay already dominates mobile payments. Low urgency but worth monitoring.",
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "Big Tech",
    threatLevel: "Moderate",
    keywords: ["amazon travel", "alexa travel", "prime travel", "amazon flights"],
    valueChainTarget: ["Discovery", "Booking"],
    color: "#FF9900",
    implication: "Amazon has the customer base and logistics to disrupt travel. Prime Travel or Alexa-based booking could emerge. Monitor for corporate travel procurement moves.",
  },
  {
    id: "meta",
    name: "Meta",
    category: "Big Tech",
    threatLevel: "Low",
    keywords: ["meta travel", "facebook travel", "instagram travel", "whatsapp travel", "meta ai travel"],
    valueChainTarget: ["Discovery"],
    color: "#1877F2",
    implication: "Meta's travel impact is primarily through social discovery and advertising. Low direct threat to distribution, but could influence how travelers find options.",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "AI Native",
    threatLevel: "Moderate",
    keywords: ["perplexity"],
    valueChainTarget: ["Discovery"],
    color: "#6C5CE7",
    implication: "Perplexity's AI search with citations could become a travel research tool. If they add booking, it threatens GDS-powered metasearch.",
  },
  {
    id: "booking",
    name: "Booking Holdings",
    category: "Travel Incumbent",
    threatLevel: "High",
    keywords: ["booking.com", "booking holdings", "priceline", "agoda", "kayak"],
    valueChainTarget: ["Aggregation", "Booking", "Servicing"],
    color: "#003580",
    implication: "Booking Holdings is Amadeus's largest customer and biggest potential disintermediator. Their AI investments aim to reduce GDS dependency. Critical to maintain value proposition.",
  },
  {
    id: "expedia",
    name: "Expedia Group",
    category: "Travel Incumbent",
    threatLevel: "Elevated",
    keywords: ["expedia", "vrbo", "hotels.com", "trivago"],
    valueChainTarget: ["Aggregation", "Booking", "Servicing"],
    color: "#FBAF00",
    implication: "Expedia is investing in AI-powered travel planning. Their OpenAI partnership could reduce reliance on GDS for content and shopping.",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Commerce Infra",
    threatLevel: "Moderate",
    keywords: ["stripe", "stripe travel", "instant checkout"],
    valueChainTarget: ["Payments", "Settlement"],
    color: "#635BFF",
    implication: "Stripe's payment infrastructure could enable new booking channels to process transactions without traditional BSP/ARC settlement. Threat to Amadeus Payments.",
  },
  {
    id: "grab",
    name: "Grab / Super-Apps",
    category: "Super-App",
    threatLevel: "High",
    keywords: ["grab", "grabpay", "wechat", "paytm", "super app", "super-app"],
    valueChainTarget: ["Discovery", "Booking", "Payments"],
    color: "#00B14F",
    implication: "Super-apps in APAC are building integrated travel booking within their ecosystems. They bypass traditional distribution entirely. Critical threat in high-growth markets.",
  },
  {
    id: "sabre",
    name: "Sabre Corporation",
    category: "GDS Competitor",
    threatLevel: "High",
    keywords: ["sabre corporation", "sabre travel", "sabre gds", "sabre hospitality"],
    valueChainTarget: ["Aggregation", "Booking", "Settlement", "Servicing"],
    color: "#CC0000",
    implication: "Direct GDS competitor. Their AI investments in retailing and pricing optimization directly compete with Amadeus offerings. Monitor for customer wins/losses.",
  },
  {
    id: "travelport",
    name: "Travelport",
    category: "GDS Competitor",
    threatLevel: "Elevated",
    keywords: ["travelport"],
    valueChainTarget: ["Aggregation", "Booking", "Settlement"],
    color: "#1E3A5F",
    implication: "Travelport+ platform modernization with NDC focus. Competing for the same agency customers. Monitor their content aggregation and AI capabilities.",
  },
];

export function getCompetitorById(id: string): TrackedCompetitor | undefined {
  return competitors.find((c) => c.id === id);
}

export function getCompetitorsByThreat(level: string): TrackedCompetitor[] {
  return competitors.filter((c) => c.threatLevel === level);
}

export const threatOrder = ["Critical", "High", "Elevated", "Moderate", "Low"];

export function sortByThreat(a: TrackedCompetitor, b: TrackedCompetitor): number {
  return threatOrder.indexOf(a.threatLevel) - threatOrder.indexOf(b.threatLevel);
}
