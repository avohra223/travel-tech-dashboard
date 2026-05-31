"use client";

import { useState } from "react";
import {
  Radar,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  Calendar,
  Newspaper,
  TrendingUp,
} from "lucide-react";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  isoDate: string;
  ageDays: number;
  relevance: number;
  matchedKeywords: string[];
};

type ScanResult = {
  company: string;
  domain: string;
  query: string;
  total: number;
  counts: { d30: number; d120: number; d180: number; d365: number };
  items: NewsItem[];
  generatedAt: string;
};

const WINDOWS = [
  { key: "d30", label: "Last 30 days", days: 30 },
  { key: "d120", label: "Last 120 days", days: 120 },
  { key: "d180", label: "Last 6 months", days: 180 },
  { key: "d365", label: "Last year", days: 366 },
] as const;

type WindowKey = (typeof WINDOWS)[number]["key"];

const EXAMPLES = [
  { label: "JPMorgan Chase", url: "jpmorganchase.com" },
  { label: "Revolut", url: "revolut.com" },
  { label: "Uber", url: "uber.com" },
  { label: "OpenAI", url: "openai.com" },
];

export default function BlindsideRadarPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeWindow, setActiveWindow] = useState<WindowKey>("d365");

  const runScan = async (urlValue: string) => {
    const value = urlValue.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/blindside-radar?url=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Scan failed (${res.status})`);
        return;
      }
      setResult(data as ScanResult);
      setActiveWindow("d365");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const visibleItems =
    result?.items.filter(
      (i) => i.ageDays <= WINDOWS.find((w) => w.key === activeWindow)!.days
    ) ?? [];

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#0a0e27] via-[#0d1635] to-[#000208] text-white">
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-1 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.5)]">
            <Radar size={22} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
              Blindside Radar
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-2xl">
              Paste any company&apos;s website. The radar scans the world&apos;s news
              for what that company has been doing in <strong>travel</strong> over
              the last year — built to catch non-travel giants quietly moving into
              Amadeus&apos;s territory.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runScan(input)}
                placeholder="e.g. revolut.com or https://www.uber.com"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 text-sm placeholder:text-white/30"
              />
            </div>
            <button
              onClick={() => runScan(input)}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Radar size={16} />
                  Scan
                </>
              )}
            </button>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-white/40">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.url}
                onClick={() => {
                  setInput(ex.url);
                  runScan(ex.url);
                }}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Scan failed</p>
              <p className="text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center py-16 text-white/50">
            <Loader2 size={32} className="animate-spin mb-3 text-cyan-400" />
            <p className="text-sm">Searching the world&apos;s news for travel signals…</p>
            <p className="text-xs text-white/30 mt-1">
              Identifying the company and scanning the last 12 months
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-8">
            {/* Company summary */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold">{result.company}</h2>
                  <a
                    href={`https://${result.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-300/80 hover:text-cyan-200 inline-flex items-center gap-1"
                  >
                    {result.domain}
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-cyan-300">{result.total}</p>
                  <p className="text-xs text-white/50">
                    travel-related news items in the last year
                  </p>
                </div>
              </div>

              {/* Verdict line */}
              <div className="mt-4 flex items-start gap-2 text-sm">
                <TrendingUp size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <p className="text-white/80">{verdict(result)}</p>
              </div>
            </div>

            {/* Window filter chips with counts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {WINDOWS.map((w) => {
                const count = result.counts[w.key];
                const isActive = activeWindow === w.key;
                return (
                  <button
                    key={w.key}
                    onClick={() => setActiveWindow(w.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white/75 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Calendar size={14} />
                    {w.label}
                    <span
                      className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${
                        isActive ? "bg-black/10 text-black" : "bg-white/10 text-white/80"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* News list */}
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-white/50">
                <Newspaper size={32} className="mb-3 text-white/30" />
                <p className="text-sm font-medium text-white/70">
                  No travel-related news in this window
                </p>
                <p className="text-xs text-white/40 mt-1 max-w-md">
                  {result.total === 0
                    ? `We found no travel-tech activity for ${result.company} in the last year. That itself is a signal — they are not visibly moving into travel yet.`
                    : "Try widening the time window above."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleItems.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/25 p-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-[15px] leading-snug group-hover:text-cyan-200 transition-colors">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-white/50">
                          <span className="font-medium text-white/70">
                            {item.source}
                          </span>
                          <span>{relativeDate(item.ageDays)}</span>
                          <span className="text-white/30">
                            {formatDate(item.isoDate)}
                          </span>
                          {item.matchedKeywords.length > 0 && (
                            <span className="inline-flex gap-1">
                              {item.matchedKeywords.slice(0, 3).map((k) => (
                                <span
                                  key={k}
                                  className="px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300/80 text-[10px]"
                                >
                                  {k}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink
                        size={15}
                        className="shrink-0 text-white/30 group-hover:text-cyan-300 transition-colors mt-1"
                      />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Methodology footnote */}
            <p className="text-[11px] text-white/30 mt-6 leading-relaxed">
              Source: Google News index, filtered to items mentioning travel,
              airline, hotel, booking, flight, tourism, hospitality, aviation or
              airport terms and scoped to the last 12 months. This aggregates
              published news — it is a fast signal, not an exhaustive audit.
              Query used:{" "}
              <code className="text-white/40">{result.query}</code>
            </p>
          </div>
        )}

        {/* Empty initial state */}
        {!result && !loading && !error && (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <Radar size={36} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm text-white/60 max-w-md mx-auto">
              Enter a company website above to scan for travel-tech activity. Best
              used on <strong>non-travel companies</strong> — banks, fintechs,
              big tech, super-apps, retailers — to detect lateral moves into
              travel before they become obvious.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Helpers -----------------------------------------------------------------

function verdict(r: ScanResult): string {
  const { d30, d120, d365 } = r.counts;
  if (r.total === 0)
    return `No visible travel-tech activity for ${r.company} in the last year. Not currently moving into travel — worth a periodic re-scan.`;
  const recent = d30;
  if (recent >= 5)
    return `High recent activity: ${recent} travel-related items in just the last 30 days. ${r.company} appears to be actively moving in travel right now.`;
  if (d120 >= 5)
    return `Building momentum: ${d120} travel-related items in the last 120 days. Worth watching closely.`;
  if (d365 >= 3)
    return `Some travel-tech signals over the year (${d365} items), but no recent surge. Early or exploratory.`;
  return `Light footprint: only ${d365} travel-related item${
    d365 === 1 ? "" : "s"
  } in the past year. Minimal travel activity so far.`;
}

function relativeDate(ageDays: number): string {
  if (ageDays <= 0) return "Today";
  if (ageDays === 1) return "Yesterday";
  if (ageDays < 7) return `${ageDays} days ago`;
  if (ageDays < 30) return `${Math.floor(ageDays / 7)} week${Math.floor(ageDays / 7) === 1 ? "" : "s"} ago`;
  if (ageDays < 365)
    return `${Math.floor(ageDays / 30)} month${Math.floor(ageDays / 30) === 1 ? "" : "s"} ago`;
  return "Over a year ago";
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
