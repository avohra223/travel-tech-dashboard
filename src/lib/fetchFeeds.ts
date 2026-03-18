import { classifySignal, deduplicateSignals, type Signal } from "./signals";
import { getSettings, type FeedConfig } from "./store";

interface RSSItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  feedName?: string;
  feedCategory?: "travel" | "tech" | "startup" | "general";
}

function parseXML(xmlText: string): Omit<RSSItem, "feedName" | "feedCategory">[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const items: Omit<RSSItem, "feedName" | "feedCategory">[] = [];

  // RSS 2.0
  const rssItems = doc.querySelectorAll("item");
  rssItems.forEach((item) => {
    items.push({
      title: item.querySelector("title")?.textContent?.trim() || "",
      link: item.querySelector("link")?.textContent?.trim() || "",
      pubDate: item.querySelector("pubDate")?.textContent?.trim() || "",
      description: item.querySelector("description")?.textContent?.trim() || "",
      content: item.querySelector("content\\:encoded, encoded")?.textContent?.trim() || "",
    });
  });

  // Atom feeds
  if (items.length === 0) {
    const entries = doc.querySelectorAll("entry");
    entries.forEach((entry) => {
      const link =
        entry.querySelector("link[rel='alternate']")?.getAttribute("href") ||
        entry.querySelector("link")?.getAttribute("href") || "";
      items.push({
        title: entry.querySelector("title")?.textContent?.trim() || "",
        link,
        pubDate:
          entry.querySelector("published")?.textContent?.trim() ||
          entry.querySelector("updated")?.textContent?.trim() || "",
        description:
          entry.querySelector("summary")?.textContent?.trim() ||
          entry.querySelector("content")?.textContent?.trim() || "",
      });
    });
  }

  return items;
}

async function fetchSingleFeed(feedUrl: string): Promise<Omit<RSSItem, "feedName" | "feedCategory">[]> {
  try {
    const proxyUrl = `/api/feed?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return [];
    const text = await response.text();
    return parseXML(text);
  } catch (err) {
    console.warn(`Failed to fetch feed: ${feedUrl}`, err);
    return [];
  }
}

export interface FetchResult {
  signals: Signal[];
  feedResults: { name: string; url: string; count: number; relevant: number; error?: string }[];
  totalFetched: number;
  totalRelevant: number;
}

export async function fetchAllFeeds(): Promise<FetchResult> {
  const settings = getSettings();
  const enabledFeeds = settings.feeds.filter((f) => f.enabled);

  const feedResults: FetchResult["feedResults"] = [];
  const allItems: RSSItem[] = [];

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    enabledFeeds.map(async (feed) => {
      const items = await fetchSingleFeed(feed.url);
      return { feed, items };
    })
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const feed = enabledFeeds[i];

    if (result.status === "fulfilled") {
      const { items } = result.value;
      feedResults.push({
        name: feed.name,
        url: feed.url,
        count: items.length,
        relevant: 0, // filled after classification
      });
      // Tag items with feed metadata
      for (const item of items) {
        allItems.push({
          ...item,
          feedName: feed.name,
          feedCategory: feed.category,
        });
      }
    } else {
      feedResults.push({
        name: feed.name,
        url: feed.url,
        count: 0,
        relevant: 0,
        error: "Fetch failed",
      });
    }
  }

  const totalFetched = allItems.length;

  // Classify each item with feed category awareness
  const signals: Signal[] = [];
  for (const item of allItems) {
    const signal = classifySignal({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      content: item.content,
      source: item.feedName,
      feedCategory: item.feedCategory,
    });
    if (signal) {
      signal.source = item.feedName || signal.source;
      signal.feedCategory = item.feedCategory || "general";
      signals.push(signal);
    }
  }

  const deduped = deduplicateSignals(signals);

  // Update relevant counts per feed
  for (const fr of feedResults) {
    fr.relevant = deduped.filter((s) => s.source === fr.name).length;
  }

  return {
    signals: deduped.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    feedResults,
    totalFetched,
    totalRelevant: deduped.length,
  };
}
