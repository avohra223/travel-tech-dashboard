"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { detectTrends } from "@/lib/signals";
import { competitors } from "@/lib/competitors";
import StatCard from "@/components/ui/StatCard";
import { TrendingUp, Zap, Target, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const velocityColors: Record<string, string> = {
  Accelerating: "text-red-500 bg-red-50",
  Stable: "text-gray-500 bg-gray-50",
  Emerging: "text-blue-500 bg-blue-50",
};

const impactColors: Record<string, string> = { Critical: "bg-red-600 text-white", High: "bg-orange-500 text-white", Medium: "bg-yellow-400 text-gray-800" };

export default function MarketTrendsPage() {
  const { signals } = useDashboard();
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);

  const trends = detectTrends(signals);
  const trendSignalCount = trends.reduce((sum, t) => sum + t.signalCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">Market Trends</h1>
        <p className="text-sm text-gray-500 mt-1">AI-detected patterns from signal analysis — what trends are forming?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Active Trends" value={trends.length} icon={TrendingUp} />
        <StatCard label="Signals Backing Trends" value={trendSignalCount} icon={Zap} color="text-amadeus-accent" />
      </div>

      <div className="space-y-4">
        {trends.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No trends detected yet. Click <strong>Refresh</strong> to fetch live signals.</div>
        ) : trends.map((trend) => {
          const isExpanded = expandedTrend === trend.id;
          return (
            <div key={trend.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setExpandedTrend(isExpanded ? null : trend.id)} className="w-full px-5 py-4 text-left hover:bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-amadeus-deep">{trend.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{trend.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{trend.signalCount} signals</span>
                      <span className="text-gray-200">|</span>
                      <div className="flex gap-1">
                        {trend.valueChainLayers.slice(0, 4).map((l) => <span key={l} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{l}</span>)}
                      </div>
                      <span className="text-gray-200">|</span>
                      <div className="flex gap-1">
                        {trend.competitorIds.slice(0, 5).map((cId) => {
                          const comp = competitors.find((c) => c.id === cId);
                          return comp ? <div key={cId} className="w-4 h-4 rounded-full" style={{ backgroundColor: comp.color }} title={comp.name} /> : null;
                        })}
                        {trend.competitorIds.length > 5 && <span className="text-[10px] text-gray-400">+{trend.competitorIds.length - 5}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400 mt-1" /> : <ChevronDown size={16} className="text-gray-400 mt-1" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Source Signals ({trend.signals.length})</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {trend.signals.map((signal) => (
                        <div key={signal.id} className="flex items-start gap-2 text-sm">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${impactColors[signal.impact]}`}>{signal.impact}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 text-sm leading-snug">{signal.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {signal.source} · {(() => { try { return formatDistanceToNow(new Date(signal.date), { addSuffix: true }); } catch { return signal.date; } })()}
                            </p>
                          </div>
                          {signal.link && <a href={signal.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amadeus-accent flex-shrink-0"><ExternalLink size={12} /></a>}
                        </div>
                      ))}
                    </div>
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
