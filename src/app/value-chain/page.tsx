"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { valueChainLayers } from "@/lib/signals";
import { competitors } from "@/lib/competitors";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const layerDescriptions: Record<string, string> = {
  Discovery: "How travelers find and research travel options — search, AI assistants, meta-search, social media",
  Aggregation: "How inventory from multiple suppliers is collected and normalized — GDS systems, API aggregators, bedbanks",
  Booking: "How the actual transaction happens — OTA checkout, direct booking, AI agent booking",
  Settlement: "How money flows between parties after booking — BSP/ARC, payment processing, card networks",
  Servicing: "Post-booking support: changes, cancellations, disruptions — customer service, rebooking, duty of care",
  Payments: "Payment methods and financial infrastructure — cards, wallets, BNPL, embedded finance",
};

const layerColors: Record<string, string> = {
  Discovery: "border-blue-500 bg-blue-50",
  Aggregation: "border-purple-500 bg-purple-50",
  Booking: "border-green-500 bg-green-50",
  Settlement: "border-amber-500 bg-amber-50",
  Servicing: "border-rose-500 bg-rose-50",
  Payments: "border-cyan-500 bg-cyan-50",
};

const layerAccent: Record<string, string> = {
  Discovery: "bg-blue-500",
  Aggregation: "bg-purple-500",
  Booking: "bg-green-500",
  Settlement: "bg-amber-500",
  Servicing: "bg-rose-500",
  Payments: "bg-cyan-500",
};

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

export default function ValueChainPage() {
  const { signals } = useDashboard();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentSignals = signals.filter(
    (s) => new Date(s.date) >= thirtyDaysAgo
  );

  // Count signals per layer
  const layerCounts: Record<string, number> = {};
  for (const s of recentSignals) {
    for (const layer of s.valueChainLayers) {
      layerCounts[layer] = (layerCounts[layer] || 0) + 1;
    }
  }

  // Competitors per layer
  const layerCompetitors: Record<string, Set<string>> = {};
  for (const s of recentSignals) {
    for (const layer of s.valueChainLayers) {
      if (!layerCompetitors[layer]) layerCompetitors[layer] = new Set();
      for (const cId of s.competitors) {
        layerCompetitors[layer].add(cId);
      }
    }
  }

  // Signals for selected layer
  const layerSignals = selectedLayer
    ? signals.filter((s) => s.valueChainLayers.includes(selectedLayer))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">
          Value Chain Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Where in the travel distribution chain is disruption concentrated?
        </p>
      </div>

      {/* Visual Flow */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-stretch">
          {valueChainLayers.map((layer, i) => {
            const count = layerCounts[layer] || 0;
            const comps = layerCompetitors[layer]
              ? Array.from(layerCompetitors[layer])
              : [];
            const isSelected = selectedLayer === layer;
            const maxCount = Math.max(...Object.values(layerCounts), 1);
            const intensity = count / maxCount;

            return (
              <div key={layer} className="flex items-stretch gap-3 flex-1 min-w-[160px]">
                <button
                  onClick={() =>
                    setSelectedLayer(isSelected ? null : layer)
                  }
                  className={`flex-1 rounded-xl border-2 p-4 text-left transition-all
                    ${isSelected ? `${layerColors[layer]} border-opacity-100 shadow-md scale-[1.02]` : "border-gray-200 bg-white hover:border-gray-300"}
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${layerAccent[layer]}`} />
                    <span className="text-sm font-semibold text-gray-800">
                      {layer}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-amadeus-deep mb-1">
                    {count}
                  </p>
                  <p className="text-[10px] text-gray-400 mb-2">signals (30d) · click to see all</p>

                  {/* Mini competitor dots */}
                  <div className="flex gap-1 flex-wrap">
                    {comps.slice(0, 5).map((cId) => {
                      const comp = competitors.find((c) => c.id === cId);
                      return comp ? (
                        <div
                          key={cId}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                          style={{ backgroundColor: comp.color }}
                          title={comp.name}
                        >
                          {comp.name[0]}
                        </div>
                      ) : null;
                    })}
                    {comps.length > 5 && (
                      <span className="text-[10px] text-gray-400 self-center">
                        +{comps.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Intensity bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${layerAccent[layer]} transition-all`}
                      style={{ width: `${Math.max(intensity * 100, 5)}%` }}
                    />
                  </div>
                </button>

                {/* Arrow between layers */}
                {i < valueChainLayers.length - 1 && (
                  <div className="hidden lg:flex items-center text-gray-300 text-lg">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer Description */}
      {selectedLayer && (
        <div className={`rounded-xl border-2 p-4 ${layerColors[selectedLayer]}`}>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{selectedLayer}:</span>{" "}
            {layerDescriptions[selectedLayer]}
          </p>
        </div>
      )}

      {/* Signals for selected layer */}
      {selectedLayer && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-amadeus-deep">
              {selectedLayer} Signals ({layerSignals.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {layerSignals.map((signal) => (
              <div
                key={signal.id}
                className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50/50"
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${impactColors[signal.impact]}`}
                >
                  {signal.impact}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {signal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{signal.source}</span>
                    <span>·</span>
                    <span>
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(signal.date), { addSuffix: true });
                        } catch {
                          return signal.date;
                        }
                      })()}
                    </span>
                    {signal.competitors.map((cId) => {
                      const comp = competitors.find((c) => c.id === cId);
                      return comp ? (
                        <span
                          key={cId}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                          style={{ borderColor: comp.color, color: comp.color }}
                        >
                          {comp.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                {signal.link && (
                  <a
                    href={signal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-amadeus-accent flex-shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
            {layerSignals.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No signals for this layer yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
