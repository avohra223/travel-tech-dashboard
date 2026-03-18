"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { competitors, sortByThreat } from "@/lib/competitors";
import StatCard from "@/components/ui/StatCard";
import SearchBar from "@/components/ui/SearchBar";
import { Swords, ShieldAlert, TrendingUp, Radio, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const threatColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Elevated: "bg-yellow-500 text-gray-800",
  Moderate: "bg-blue-400 text-white",
  Low: "bg-gray-300 text-gray-700",
};

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

export default function CompetitorsPage() {
  const { signals } = useDashboard();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Competitor signals — ALL signals mentioning any tracked competitor, regardless of feed source
  // (The MECE split only applies on the Overview KPI cards — this page shows the full picture per competitor)
  const competitorSignals = signals.filter(
    (s) => s.competitors.length > 0
  );

  const signalCounts: Record<string, number> = {};
  const recentMonth = competitorSignals.filter((s) => new Date(s.date) >= thirtyDaysAgo);
  for (const s of recentMonth) {
    for (const cId of s.competitors) {
      signalCounts[cId] = (signalCounts[cId] || 0) + 1;
    }
  }

  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const getVelocity = (compId: string) => {
    const recent = competitorSignals.filter(
      (s) => s.competitors.includes(compId) && new Date(s.date) >= fifteenDaysAgo
    ).length;
    const older = competitorSignals.filter(
      (s) =>
        s.competitors.includes(compId) &&
        new Date(s.date) >= thirtyDaysAgo &&
        new Date(s.date) < fifteenDaysAgo
    ).length;
    if (recent > older + 1) return "ACCELERATING";
    if (recent < older - 1) return "DECELERATING";
    return "STABLE";
  };

  const velocityIcons: Record<string, string> = {
    ACCELERATING: "text-red-500",
    STABLE: "text-gray-400",
    DECELERATING: "text-green-500",
  };

  const categories = [...new Set(competitors.map((c) => c.category))];

  const sorted = [...competitors].sort(sortByThreat);
  const filtered = sorted.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    return true;
  });

  const criticalCount = competitors.filter(
    (c) => c.threatLevel === "Critical" || c.threatLevel === "High"
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">Major Competitors</h1>
        <p className="text-sm text-gray-500">All signals tagged to tracked competitors — Big Tech, GDS rivals, OTAs, Fintech, Super-Apps</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tracked" value={competitors.length} icon={Swords} />
        <StatCard label="Critical/High" value={criticalCount} icon={ShieldAlert} color="text-threat-high" />
        <StatCard
          label="Most Active"
          value={
            Object.entries(signalCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
              ? competitors.find((c) => c.id === Object.entries(signalCounts).sort(([, a], [, b]) => b - a)[0][0])?.name || "N/A"
              : "N/A"
          }
          icon={TrendingUp}
        />
      </div>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search competitors..." />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryFilter(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!categoryFilter ? "bg-amadeus-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-amadeus-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((comp) => {
          const isExpanded = expandedId === comp.id;
          const velocity = getVelocity(comp.id);
          const allCompSignals = competitorSignals.filter((s) => s.competitors.includes(comp.id));
          const compSignals = allCompSignals.slice(0, 50);
          const totalForComp = allCompSignals.length;
          const recentCount = signalCounts[comp.id] || 0;

          // Dynamic threat: base threat from config, but downgrade if no signals back it up
          let effectiveThreat = comp.threatLevel;
          if (totalForComp === 0) {
            effectiveThreat = "Moderate"; // No evidence = can't be high threat
          } else if (recentCount === 0 && (effectiveThreat === "Critical" || effectiveThreat === "High")) {
            effectiveThreat = "Elevated"; // Had signals but none recent = downgrade
          }

          return (
            <div key={comp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : comp.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amadeus-deep">{comp.name}</span>
                      <span className="text-xs text-gray-400">{comp.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${velocityIcons[velocity]}`}>
                    {velocity === "ACCELERATING" ? "▲▲" : velocity === "DECELERATING" ? "▼▼" : "─"} {velocity}
                  </span>
                  <span className="text-xs text-gray-400">{recentCount} in last 30d · {totalForComp} total</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${threatColors[effectiveThreat]}`}>{effectiveThreat.toUpperCase()}</span>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {comp.valueChainTarget.map((layer) => (
                      <span key={layer} className="text-xs bg-amadeus-accent/10 text-amadeus-accent px-2.5 py-1 rounded-full font-medium">{layer}</span>
                    ))}
                  </div>

                  {comp.implication && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Strategic Implication for Amadeus</p>
                      <p className="text-sm text-gray-700">{comp.implication}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Latest {compSignals.length} signals{totalForComp > 50 ? ` (of ${totalForComp} total)` : ""}
                    </p>
                    {compSignals.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No signals yet. Click Refresh to fetch live data.</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {compSignals.map((signal) => (
                          <div key={signal.id} className="flex items-start gap-2 text-sm">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${impactColors[signal.impact]}`}>{signal.impact}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 text-sm leading-snug">{signal.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {signal.source} · {(() => { try { return formatDistanceToNow(new Date(signal.date), { addSuffix: true }); } catch { return signal.date; } })()}
                                {signal.valueChainLayers.map((l) => <span key={l} className="ml-1 bg-gray-100 px-1 py-0.5 rounded text-[10px]">{l}</span>)}
                              </p>
                            </div>
                            {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amadeus-accent flex-shrink-0"><ExternalLink size={12} /></a>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
