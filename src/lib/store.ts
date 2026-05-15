import type { Signal } from "./signals";
import { baselineSignals } from "./signals";

// Cache version tracking — no longer wipes signals (additive-only).
// Classification is applied dynamically so old signals get reclassified at render time.
const CACHE_VERSION = "v9-disable-dead-feeds";
const CACHE_VERSION_KEY = "amadeus_cache_version";

// Feeds we've confirmed have permanently removed their RSS endpoints.
// Disabled on migration; user can manually re-enable from Settings if any
// of them resurrect their feed.
const DEAD_FEED_NAMES = new Set(["PhocusWire", "Travel Weekly", "TTG Media"]);

const STORAGE_KEYS = {
  signals: "amadeus_signals",
  lastRefresh: "amadeus_last_refresh",
  settings: "amadeus_settings",
  feedStats: "amadeus_feed_stats",
} as const;

// Per-feed stats from the most recent refresh — used by Settings page to
// surface fetched / relevant counts for diagnosis.
export interface FeedStatsSnapshot {
  refreshedAt: string;
  totalFetched: number;
  totalRelevant: number;
  perFeed: { name: string; url: string; count: number; relevant: number; error?: string }[];
}

// Update version marker without wiping data — signals only grow, never shrink
function checkCacheVersion(): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(CACHE_VERSION_KEY);
  if (stored !== CACHE_VERSION) {
    // Migration on version bump: disable feeds whose upstream RSS we've
    // confirmed is permanently dead. Idempotent — safe to run multiple times.
    try {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.settings);
      if (rawSettings) {
        const saved = JSON.parse(rawSettings) as DashboardSettings;
        if (Array.isArray(saved.feeds)) {
          let mutated = false;
          saved.feeds = saved.feeds.map((f) => {
            if (DEAD_FEED_NAMES.has(f.name) && f.enabled) {
              mutated = true;
              return { ...f, enabled: false };
            }
            return f;
          });
          if (mutated) {
            localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(saved));
            console.log("[Amadeus] Disabled dead feeds:", Array.from(DEAD_FEED_NAMES).join(", "));
          }
        }
      }
    } catch (e) {
      console.warn("[Amadeus] Migration failed:", e);
    }
    // Just update the version — do NOT wipe signals
    // Startup names and classification are computed dynamically from signal data,
    // so old signals get reclassified automatically without deletion.
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`[Amadeus] Cache version updated: ${stored} → ${CACHE_VERSION} (signals preserved)`);
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
  // Confirmed dead at the upstream — kept for visibility but disabled.
  { name: "PhocusWire", url: "https://www.phocuswire.com/feed", enabled: false, category: "travel" },
  { name: "Travel Weekly", url: "https://www.travelweekly.com/rss/news", enabled: false, category: "travel" },
  { name: "TTG Media", url: "https://www.ttgmedia.com/rss", enabled: false, category: "travel" },
  { name: "Hospitality Net", url: "https://www.hospitalitynet.org/rss/news.xml", enabled: true, category: "travel" },
  { name: "WebInTravel", url: "https://www.webintravel.com/feed/", enabled: true, category: "travel" },
  { name: "Travel Daily Media", url: "https://www.traveldailymedia.com/feed/", enabled: true, category: "travel" },
  { name: "Future Travel Experience", url: "https://www.futuretravelexperience.com/feed/", enabled: true, category: "travel" },
  { name: "Hospitality Tech Magazine", url: "https://www.hospitalitytech.com/rss.xml", enabled: true, category: "travel" },
  // Replacements added to compensate for the three dead founding feeds.
  { name: "The Company Dime", url: "https://thecompanydime.com/feed/", enabled: true, category: "travel" },
  { name: "Aviation Today", url: "https://www.aviationtoday.com/feed/", enabled: true, category: "travel" },
  { name: "Hotel Management", url: "https://www.hotelmanagement.net/rss.xml", enabled: true, category: "travel" },

  // TECH (needs strong travel filter)
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", enabled: true, category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", enabled: true, category: "tech" },

  // STARTUP DISCOVERY — direct feeds from startup/funding outlets
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", enabled: true, category: "startup" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", enabled: true, category: "startup" },
  { name: "EU-Startups", url: "https://www.eu-startups.com/feed/", enabled: true, category: "startup" },
  { name: "Sifted", url: "https://sifted.eu/feed", enabled: true, category: "startup" },
  { name: "Tech.eu", url: "https://tech.eu/feed/", enabled: true, category: "startup" },
  { name: "Tech in Asia", url: "https://www.techinasia.com/feed", enabled: true, category: "startup" },

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
    const saved = JSON.parse(raw) as Partial<DashboardSettings>;
    const savedFeeds = saved.feeds ?? [];
    // Merge new default feeds (by name) into saved feeds so existing users
    // automatically pick up newly added sources without losing customizations.
    if (savedFeeds.length === 0) {
      return { ...defaultSettings, ...saved, feeds: defaultFeeds };
    }
    const savedFeedNames = new Set(savedFeeds.map((f) => f.name));
    const newDefaults = defaultFeeds.filter((f) => !savedFeedNames.has(f.name));
    return {
      ...defaultSettings,
      ...saved,
      feeds: [...savedFeeds, ...newDefaults],
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: DashboardSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

// --- Feed Stats (per-refresh diagnostic) ---
export function getFeedStats(): FeedStatsSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.feedStats);
    if (!raw) return null;
    return JSON.parse(raw) as FeedStatsSnapshot;
  } catch {
    return null;
  }
}

export function storeFeedStats(stats: FeedStatsSnapshot): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.feedStats, JSON.stringify(stats));
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
