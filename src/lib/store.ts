import type { Signal } from "./signals";
import { baselineSignals } from "./signals";

// Bump this version whenever signal classification logic changes.
// This forces a cache clear so stale/incorrectly-tagged signals are wiped.
const CACHE_VERSION = "v3-title-only";
const CACHE_VERSION_KEY = "amadeus_cache_version";

const STORAGE_KEYS = {
  signals: "amadeus_signals",
  lastRefresh: "amadeus_last_refresh",
  settings: "amadeus_settings",
} as const;

// Auto-clear stale cache when code version changes
function checkCacheVersion(): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(CACHE_VERSION_KEY);
  if (stored !== CACHE_VERSION) {
    // Classification logic changed — wipe stale signals (keep settings)
    localStorage.removeItem(STORAGE_KEYS.signals);
    localStorage.removeItem(STORAGE_KEYS.lastRefresh);
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`[Amadeus] Cache cleared: ${stored} → ${CACHE_VERSION}`);
  }
}

// Run on module load
if (typeof window !== "undefined") {
  checkCacheVersion();
}

export interface FeedConfig {
  name: string;
  url: string;
  enabled: boolean;
  category: "travel" | "tech" | "startup" | "general";
}

export interface DashboardSettings {
  feeds: FeedConfig[];
  autoRefreshInterval: number;
  travelKeywords: string[];
  aiKeywords: string[];
}

const defaultFeeds: FeedConfig[] = [
  // TRAVEL-SPECIFIC (inherently relevant)
  { name: "Skift", url: "https://skift.com/feed/", enabled: true, category: "travel" },
  { name: "PhocusWire", url: "https://www.phocuswire.com/feed", enabled: true, category: "travel" },
  { name: "Travel Weekly", url: "https://www.travelweekly.com/rss/news", enabled: true, category: "travel" },
  { name: "TTG Media", url: "https://www.ttgmedia.com/rss", enabled: true, category: "travel" },

  // TECH (needs strong travel filter)
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", enabled: true, category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", enabled: true, category: "tech" },

  // STARTUP DISCOVERY — Google News RSS (broad coverage)
  { name: "GNews: Travel Tech Startup", url: "https://news.google.com/rss/search?q=travel+tech+startup+funding&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Travel AI Startup", url: "https://news.google.com/rss/search?q=travel+AI+startup+raises&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Hotel Tech Startup", url: "https://news.google.com/rss/search?q=hotel+technology+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Airline Tech Startup", url: "https://news.google.com/rss/search?q=airline+technology+AI+booking+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Travel Fintech", url: "https://news.google.com/rss/search?q=travel+fintech+OR+%22travel+payments%22+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  // More targeted startup queries
  { name: "GNews: Travel Startup Raises", url: "https://news.google.com/rss/search?q=%22travel+startup%22+%22raises%22+OR+%22series%22+OR+%22funding%22&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Hospitality Tech", url: "https://news.google.com/rss/search?q=hospitality+tech+startup+OR+%22hotel+tech%22+funding&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: GDS Alternative", url: "https://news.google.com/rss/search?q=%22GDS+alternative%22+OR+%22replace+GDS%22+OR+%22travel+distribution+startup%22&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Travel API Platform", url: "https://news.google.com/rss/search?q=%22travel+API%22+OR+%22flight+API%22+OR+%22hotel+API%22+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Crunchbase Travel", url: "https://news.google.com/rss/search?q=site:crunchbase.com+travel+OR+hospitality+OR+airline+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Tracxn Travel", url: "https://news.google.com/rss/search?q=site:tracxn.com+travel+tech+OR+hospitality+tech&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: PitchBook Travel", url: "https://news.google.com/rss/search?q=%22pitchbook%22+travel+tech+funding+OR+%22travel+startup%22&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: EU Travel Startups", url: "https://news.google.com/rss/search?q=site:eu-startups.com+travel+OR+tourism+OR+hospitality&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Y Combinator Travel", url: "https://news.google.com/rss/search?q=%22Y+Combinator%22+travel+OR+airline+OR+hotel+OR+booking&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },
  { name: "GNews: Phocuswright Startup", url: "https://news.google.com/rss/search?q=phocuswright+startup+OR+%22travel+innovation%22+startup&hl=en&gl=US&ceid=US:en", enabled: true, category: "startup" },

  // GENERAL TRAVEL TECH + INDUSTRY NEWS
  { name: "GNews: AI Travel Disruption", url: "https://news.google.com/rss/search?q=AI+travel+industry+disruption&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Amadeus Competitors", url: "https://news.google.com/rss/search?q=Amadeus+OR+Sabre+OR+Travelport+AI+travel&hl=en&gl=US&ceid=US:en", enabled: true, category: "travel" },
  { name: "GNews: Corporate Travel Tech", url: "https://news.google.com/rss/search?q=corporate+travel+technology+AI&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Airline Industry News", url: "https://news.google.com/rss/search?q=airline+industry+technology+OR+digital+OR+AI&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Hotel Industry Tech", url: "https://news.google.com/rss/search?q=hotel+industry+technology+OR+%22hospitality+tech%22&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Travel Payments", url: "https://news.google.com/rss/search?q=%22travel+payments%22+OR+%22airline+payments%22+OR+%22hotel+payments%22+technology&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: NDC Airline", url: "https://news.google.com/rss/search?q=NDC+airline+OR+%22new+distribution+capability%22+OR+%22offer+and+order%22&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Tourism Technology", url: "https://news.google.com/rss/search?q=tourism+technology+OR+%22travel+tech%22+trends&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Travel Regulation", url: "https://news.google.com/rss/search?q=travel+regulation+OR+%22airline+regulation%22+OR+%22EU+travel%22+policy&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
  { name: "GNews: Sustainable Travel", url: "https://news.google.com/rss/search?q=sustainable+travel+OR+%22sustainable+aviation+fuel%22+OR+%22green+travel%22+technology&hl=en&gl=US&ceid=US:en", enabled: true, category: "general" },
];

const defaultSettings: DashboardSettings = {
  feeds: defaultFeeds,
  autoRefreshInterval: 0,
  travelKeywords: [],
  aiKeywords: [],
};

// --- Signal Storage ---
export function getStoredSignals(): Signal[] {
  if (typeof window === "undefined") return baselineSignals;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.signals);
    if (!raw) return baselineSignals;
    const parsed = JSON.parse(raw) as Signal[];
    return parsed.length > 0 ? parsed : baselineSignals;
  } catch {
    return baselineSignals;
  }
}

export function storeSignals(signals: Signal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.signals, JSON.stringify(signals));
}

export function mergeSignals(existing: Signal[], incoming: Signal[]): Signal[] {
  const map = new Map<string, Signal>();
  for (const s of existing) map.set(s.id, s);
  for (const s of incoming) map.set(s.id, s);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// --- Last Refresh ---
export function getLastRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.lastRefresh);
}

export function setLastRefresh(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.lastRefresh, new Date().toISOString());
}

// --- Settings ---
export function getSettings(): DashboardSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: DashboardSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function exportAllData(): string {
  return JSON.stringify({
    signals: getStoredSignals(),
    settings: getSettings(),
    lastRefresh: getLastRefresh(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
