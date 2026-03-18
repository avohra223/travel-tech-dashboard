"use client";

import { useDashboard } from "@/lib/DashboardContext";
import { competitors, sortByThreat } from "@/lib/competitors";
import { valueChainLayers } from "@/lib/signals";
import StatCard from "@/components/ui/StatCard";
import { Swords, Radio, ShieldAlert, MapPin, ExternalLink, ChevronRight, Rocket, Newspaper } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

const threatColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Elevated: "bg-yellow-500 text-gray-800",
  Moderate: "bg-blue-400 text-white",
  Low: "bg-gray-300 text-gray-700",
};

export default function OverviewPage() {
  const { signals } = useDashboard();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentSignals = signals.filter((s) => new Date(s.date) >= sevenDaysAgo);
  const recentMonth = signals.filter((s) => new Date(s.date) >= thirtyDaysAgo);

  // Section counts — MECE: each signal counted in exactly ONE primary bucket
  const startupSignals = signals.filter((s) => s.isStartup || s.feedCategory === "startup");
  const startupIds = new Set(startupSignals.map((s) => s.id));
  const competitorSignals = signals.filter((s) => s.competitors.length > 0 && !startupIds.has(s.id) && s.feedCategory !== "general");
  const competitorIds = new Set(competitorSignals.map((s) => s.id));
  const generalSignals = signals.filter((s) => !startupIds.has(s.id) && !competitorIds.has(s.id));

  // Value chain hotspot
  const layerCounts: Record<string, number> = {};
  for (const s of recentMonth) {
    for (const layer of s.valueChainLayers) {
      layerCounts[layer] = (layerCounts[layer] || 0) + 1;
    }
  }
  const hotspot = Object.entries(layerCounts).sort(([, a], [, b]) => b - a)[0] || null;
  const totalLayerSignals = Object.values(layerCounts).reduce((a, b) => a + b, 0);

  // Competitor signal counts
  const competitorSignalCounts: Record<string, number> = {};
  for (const s of recentMonth) {
    for (const cId of s.competitors) {
      competitorSignalCounts[cId] = (competitorSignalCounts[cId] || 0) + 1;
    }
  }

  const sortedCompetitors = [...competitors].sort(sortByThreat);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amadeus-deep">AI Disruptions Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live competitive intelligence for travel distribution</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Signals" value={signals.length} icon={Radio} color="text-amadeus-accent" />
        <StatCard label="Competitor Signals" value={competitorSignals.length} icon={Swords} />
        <StatCard label="Startup Signals" value={startupSignals.length} icon={Rocket} />
        <StatCard label="General News" value={generalSignals.length} icon={Newspaper} />
        <StatCard
          label="Hotspot"
          value={hotspot ? `${hotspot[0]} (${Math.round((hotspot[1] / totalLayerSignals) * 100)}%)` : "N/A"}
          icon={MapPin} color="text-amadeus-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Signals - 3 columns */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-amadeus-deep">Recent Signals (all)</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {signals.slice(0, 20).map((signal) => (
              <div key={signal.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${impactColors[signal.impact]}`}>{signal.impact.toUpperCase()}</span>
                      {signal.competitors.map((cId) => {
                        const comp = competitors.find((c) => c.id === cId);
                        return comp ? (
                          <span key={cId} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border" style={{ borderColor: comp.color, color: comp.color }}>{comp.name}</span>
                        ) : null;
                      })}
                      {signal.isStartup && signal.competitors.length === 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Startup</span>
                      )}
                      {signal.competitors.length === 0 && !signal.isStartup && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">General</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{signal.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{signal.source}</span>
                      <span>·</span>
                      <span>{(() => { try { return formatDistanceToNow(new Date(signal.date), { addSuffix: true }); } catch { return signal.date; } })()}</span>
                      {signal.valueChainLayers.slice(0, 2).map((layer) => (
                        <span key={layer} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{layer}</span>
                      ))}
                    </div>
                  </div>
                  {signal.link && (
                    <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amadeus-accent flex-shrink-0 mt-1">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Rankings - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-amadeus-deep">Threat Rankings</h2>
            <Link href="/competitors" className="text-xs text-amadeus-accent hover:underline flex items-center gap-0.5">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {sortedCompetitors.map((comp) => (
              <div key={comp.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{comp.name}</p>
                    <p className="text-xs text-gray-400">{comp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{competitorSignalCounts[comp.id] || 0}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${threatColors[comp.threatLevel]}`}>{comp.threatLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Chain Heatmap */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-amadeus-deep">Value Chain Heatmap (30 days)</h2>
          <Link href="/value-chain" className="text-xs text-amadeus-accent hover:underline flex items-center gap-0.5">Explore <ChevronRight size={12} /></Link>
        </div>
        <div className="flex gap-2">
          {valueChainLayers.map((layer) => {
            const count = layerCounts[layer] || 0;
            const maxCount = Math.max(...Object.values(layerCounts), 1);
            const intensity = count / maxCount;
            const bg = intensity > 0.7 ? "bg-red-500" : intensity > 0.4 ? "bg-orange-400" : intensity > 0 ? "bg-yellow-300" : "bg-gray-100";
            const text = intensity > 0.4 ? "text-white" : "text-gray-700";
            return (
              <Link key={layer} href="/value-chain" className={`flex-1 rounded-xl p-4 ${bg} ${text} text-center hover:opacity-90 transition-opacity`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium mt-1">{layer}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Signal distribution cards */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/competitors" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
          <p className="text-2xl font-bold text-amadeus-deep">{competitorSignals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Major Competitors</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Tagged to tracked companies</p>
        </Link>
        <Link href="/ai-tools" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
          <p className="text-2xl font-bold text-amadeus-deep">{startupSignals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Startups & New Entrants</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Emerging challengers</p>
        </Link>
        <Link href="/big-tech-news" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
          <p className="text-2xl font-bold text-amadeus-deep">{generalSignals.length}</p>
          <p className="text-xs text-gray-500 mt-1">General News</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Industry signals</p>
        </Link>
      </div>
    </div>
  );
}
