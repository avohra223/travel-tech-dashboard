"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { competitors } from "@/lib/competitors";
import { valueChainLayers } from "@/lib/signals";
import StatCard from "@/components/ui/StatCard";
import SearchBar from "@/components/ui/SearchBar";
import { Rocket, TrendingUp, Zap, Target, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

// Assign each signal to ONE primary layer (MECE)
// Priority order matches the value chain flow — pick the earliest stage
const layerPriority = ["Discovery", "Aggregation", "Booking", "Settlement", "Servicing", "Payments"];
function getPrimaryLayer(layers: string[]): string {
  for (const l of layerPriority) {
    if (layers.includes(l)) return l;
  }
  return layers[0] || "General";
}

export default function StartupsPage() {
  const { signals } = useDashboard();
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string | null>(null);
  const [fundingOnly, setFundingOnly] = useState(false);

  // All startup/new entrant signals — includes those that may also mention competitors
  const startupSignals = useMemo(() =>
    signals.filter((s) => s.isStartup || s.feedCategory === "startup"),
    [signals]
  );

  // MECE layer counts — each signal assigned to exactly ONE primary layer
  const layerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of startupSignals) {
      const primary = getPrimaryLayer(s.valueChainLayers);
      counts[primary] = (counts[primary] || 0) + 1;
    }
    return counts;
  }, [startupSignals]);

  // Filter signals
  let displayed = startupSignals;

  // Funding filter
  if (fundingOnly) {
    displayed = displayed.filter((s) => /raises|raised|funding|seed|series|secures|round|investment/.test(`${s.title} ${s.description || ""}`.toLowerCase()));
  }

  // Text search
  if (search) {
    const lower = search.toLowerCase();
    displayed = displayed.filter((s) =>
      s.title.toLowerCase().includes(lower) ||
      (s.description || "").toLowerCase().includes(lower) ||
      (s.startupName || "").toLowerCase().includes(lower)
    );
  }

  // MECE value chain filter — filter by PRIMARY layer
  if (layerFilter) {
    displayed = displayed.filter((s) => getPrimaryLayer(s.valueChainLayers) === layerFilter);
  }

  // Stats
  const fundedCount = startupSignals.filter((s) => /raises|raised|funding|seed|series/.test(`${s.title} ${s.description || ""}`.toLowerCase())).length;
  const criticalCount = startupSignals.filter((s) => s.impact === "Critical").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">Startups & New Entrants</h1>
        <p className="text-sm text-gray-500">Travel tech startups discovered from RSS feeds — potential disruptors to the GDS ecosystem</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setFundingOnly(false)} className="text-left">
          <StatCard label="Startup News Items" value={startupSignals.length} icon={Rocket} />
        </button>
        <button onClick={() => setFundingOnly(true)} className="text-left">
          <StatCard label="Funding Rounds Tracked" value={fundedCount} icon={TrendingUp} color={fundingOnly ? "text-white" : "text-amadeus-accent"} />
        </button>
      </div>
      {fundingOnly && (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amadeus-accent text-white px-3 py-1 rounded-full font-medium">Showing funding rounds only</span>
          <button onClick={() => setFundingOnly(false)} className="text-xs text-gray-400 hover:text-gray-600">Clear filter</button>
        </div>
      )}

      {/* MECE value chain filter — each signal in exactly one bucket */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Filter by primary value chain target (each startup counted once)</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setLayerFilter(null)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!layerFilter ? "bg-amadeus-accent text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
          >
            All <span className="font-bold ml-1">{startupSignals.length}</span>
          </button>
          {valueChainLayers.map((layer) => {
            const count = layerCounts[layer] || 0;
            if (count === 0) return null;
            const isActive = layerFilter === layer;
            return (
              <button key={layer} onClick={() => setLayerFilter(isActive ? null : layer)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-amadeus-accent text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                {layer} <span className="font-bold ml-1">{count}</span>
              </button>
            );
          })}
          {layerCounts["General"] > 0 && (
            <button onClick={() => setLayerFilter(layerFilter === "General" ? null : "General")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${layerFilter === "General" ? "bg-amadeus-accent text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
            >
              General <span className="font-bold ml-1">{layerCounts["General"]}</span>
            </button>
          )}
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search startups, funding rounds..." />

      {displayed.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm mb-2">No startup signals found{layerFilter ? ` for ${layerFilter}` : ""}.</p>
          <p className="text-gray-400 text-xs">Click <strong>Refresh</strong> to scan Google News for travel tech startups, hotel tech, airline tech, and travel fintech.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((signal) => {
            const primaryLayer = getPrimaryLayer(signal.valueChainLayers);
            return (
              <div key={signal.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impactColors[signal.impact]}`}>{signal.impact}</span>
                    {signal.startupName && (
                      <span className="text-xs font-semibold text-amadeus-deep bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{signal.startupName}</span>
                    )}
                    <span className="text-[10px] bg-amadeus-accent/10 text-amadeus-accent px-1.5 py-0.5 rounded-full font-medium">{primaryLayer}</span>
                  </div>
                  <span className="text-xs text-gray-400">{(() => { try { return formatDistanceToNow(new Date(signal.date), { addSuffix: true }); } catch { return signal.date; } })()}</span>
                </div>

                <h3 className="font-semibold text-amadeus-deep text-sm mb-1">{signal.title}</h3>
                {signal.description && <p className="text-xs text-gray-600 mb-3">{signal.description}</p>}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 items-center flex-wrap">
                    <span className="text-xs text-gray-400">{signal.source}</span>
                    {signal.valueChainLayers.map((l) => <span key={l} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{l}</span>)}
                  </div>
                  {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-amadeus-accent hover:underline text-xs flex items-center gap-1">Source <ExternalLink size={12} /></a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
