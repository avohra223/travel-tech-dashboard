"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import SearchBar from "@/components/ui/SearchBar";
import StatCard from "@/components/ui/StatCard";
import { Newspaper, AlertCircle, ExternalLink, Layers, Plane, Building, CreditCard, Scale, Leaf } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Signal } from "@/lib/signals";

// --- Category definitions ---
const newsCategories = [
  { id: "airlines", label: "Airlines & Aviation", icon: Plane, keywords: ["airline", "aviation", "flight", "airport", "carrier", "air travel", "passenger", "iata", "pilot", "aircraft", "boeing", "airbus", "lufthansa", "delta", "united", "emirates", "qatar", "ryanair", "easyjet"] },
  { id: "hotels", label: "Hotels & Hospitality", icon: Building, keywords: ["hotel", "hospitality", "accommodation", "resort", "airbnb", "marriott", "hilton", "ihg", "accor", "wyndham", "hyatt", "hostel", "lodging", "stay", "room", "property"] },
  { id: "payments", label: "Travel Payments & Fintech", icon: CreditCard, keywords: ["payment", "fintech", "wallet", "bnpl", "credit card", "checkout", "transaction", "settlement", "bsp", "arc", "merchant", "banking", "currency", "exchange"] },
  { id: "regulation", label: "Regulation & Policy", icon: Scale, keywords: ["regulation", "policy", "government", "compliance", "law", "legislation", "antitrust", "gdpr", "privacy", "eu ", "faa", "dot ", "consumer protection", "mandate", "ruling"] },
  { id: "sustainability", label: "Sustainability & ESG", icon: Leaf, keywords: ["sustainab", "carbon", "emission", "green", "esg", "climate", "environment", "eco", "offset", "renewable", "saf ", "sustainable aviation"] },
  { id: "misc", label: "Travel Tech & Miscellaneous", icon: Layers, keywords: [] }, // catch-all
] as const;

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

function categorizeSignal(signal: Signal): string {
  const text = `${signal.title} ${signal.description || ""}`.toLowerCase();
  for (const cat of newsCategories) {
    if (cat.id === "misc") continue;
    if (cat.keywords.some((kw) => text.includes(kw))) return cat.id;
  }
  return "misc";
}

export default function GeneralNewsPage() {
  const { signals } = useDashboard();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [highCriticalOnly, setHighCriticalOnly] = useState(false);

  // General News — MECE with Overview: everything that isn't startup and isn't competitor
  const generalSignals = useMemo(() => {
    const startupIds = new Set(
      signals.filter((s) => s.isStartup || s.feedCategory === "startup").map((s) => s.id)
    );
    const competitorIds = new Set(
      signals.filter((s) => s.competitors.length > 0 && !startupIds.has(s.id) && s.feedCategory !== "general").map((s) => s.id)
    );
    return signals.filter((s) => !startupIds.has(s.id) && !competitorIds.has(s.id));
  }, [signals]);

  // Categorize all general signals
  const categorized = useMemo(() => {
    const map: Record<string, Signal[]> = {};
    for (const cat of newsCategories) map[cat.id] = [];
    for (const s of generalSignals) {
      const catId = categorizeSignal(s);
      map[catId].push(s);
    }
    return map;
  }, [generalSignals]);

  // Apply filters
  let displayed = activeCategory ? (categorized[activeCategory] || []) : generalSignals;
  if (highCriticalOnly) {
    displayed = displayed.filter((s) => s.impact === "Critical" || s.impact === "High");
  }
  if (search) {
    const lower = search.toLowerCase();
    displayed = displayed.filter((s) =>
      s.title.toLowerCase().includes(lower) || (s.description || "").toLowerCase().includes(lower)
    );
  }

  const highImpactCount = generalSignals.filter((s) => s.impact === "Critical" || s.impact === "High").length;
  const sourceCount = [...new Set(generalSignals.map((s) => s.source))].length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">General Travel News</h1>
        <p className="text-sm text-gray-500">Travel industry signals not tied to any tracked competitor — pure industry intelligence</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setHighCriticalOnly(false)} className="text-left">
          <StatCard label="General Signals" value={generalSignals.length} icon={Newspaper} />
        </button>
        <button onClick={() => setHighCriticalOnly(true)} className="text-left">
          <StatCard label="High/Critical" value={highImpactCount} icon={AlertCircle} color={highCriticalOnly ? "text-white" : "text-threat-high"} />
        </button>
      </div>
      {highCriticalOnly && (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-medium">Showing High & Critical impact only</span>
          <button onClick={() => setHighCriticalOnly(false)} className="text-xs text-gray-400 hover:text-gray-600">Clear filter</button>
        </div>
      )}

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search travel news..." />

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeCategory ? "bg-amadeus-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            All ({generalSignals.length})
          </button>
          {newsCategories.map((cat) => {
            const count = categorized[cat.id]?.length || 0;
            if (count === 0 && cat.id !== "misc") return null;
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${activeCategory === cat.id ? "bg-amadeus-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <Icon size={12} />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Signal list */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No general travel signals found. Click Refresh to fetch live data.</div>
        ) : displayed.map((signal) => (
          <div key={signal.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const catId = categorizeSignal(signal);
                  const cat = newsCategories.find((c) => c.id === catId);
                  return cat ? <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">{cat.label}</span> : null;
                })()}
                <span className="text-xs text-gray-400">{(() => { try { return formatDistanceToNow(new Date(signal.date), { addSuffix: true }); } catch { return signal.date; } })()}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${impactColors[signal.impact]}`}>{signal.impact}</span>
            </div>

            <h3 className="font-semibold text-amadeus-deep text-base mb-1">{signal.title}</h3>
            {signal.description && <p className="text-sm text-gray-600 mb-3">{signal.description}</p>}

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-gray-400">{signal.source}</span>
                {signal.valueChainLayers.map((layer) => <span key={layer} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{layer}</span>)}
              </div>
              {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-amadeus-accent hover:underline text-xs flex items-center gap-1">Source <ExternalLink size={12} /></a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
