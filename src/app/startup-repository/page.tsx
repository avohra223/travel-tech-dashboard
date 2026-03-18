"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { buildStartupRepository, type StartupProfile } from "@/lib/startupRepository";
import StatCard from "@/components/ui/StatCard";
import SearchBar from "@/components/ui/SearchBar";
import { Database, Building2, DollarSign, Layers, ExternalLink, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const impactColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-400 text-gray-800",
};

export default function StartupRepositoryPage() {
  const { signals } = useDashboard();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const startups = useMemo(() => buildStartupRepository(signals), [signals]);

  // Get all sub-categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of startups) {
      counts[s.subCategory] = (counts[s.subCategory] || 0) + 1;
    }
    return counts;
  }, [startups]);

  const categories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat);

  // Apply filters
  let displayed = startups;
  if (search) {
    const lower = search.toLowerCase();
    displayed = displayed.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        s.subCategory.toLowerCase().includes(lower)
    );
  }
  if (categoryFilter) {
    displayed = displayed.filter((s) => s.subCategory === categoryFilter);
  }

  const totalFunded = startups.filter((s) => s.totalFunding !== "Undisclosed").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">Startup Repository</h1>
        <p className="text-sm text-gray-500">
          Unique travel tech companies extracted from all signal sources — a living database of potential disruptors
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Companies Tracked" value={startups.length} icon={Building2} />
        <StatCard label="With Known Funding" value={totalFunded} icon={DollarSign} color="text-amadeus-accent" />
        <StatCard label="Sub-Categories" value={categories.length} icon={Layers} />
        <StatCard label="Data Sources" value={[...new Set(startups.flatMap((s) => s.signals.map((sig) => sig.source)))].length} icon={Database} />
      </div>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search companies, categories..." />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !categoryFilter ? "bg-amadeus-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({startups.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-amadeus-accent text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
      </div>

      {/* Startup table */}
      {displayed.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No startups found. Click <strong>Refresh</strong> to discover travel tech startups from 15+ news sources.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-2 text-[10px] font-bold text-gray-400 uppercase">
            <div className="col-span-3">Company</div>
            <div className="col-span-2">Sub-Category</div>
            <div className="col-span-2">Funding</div>
            <div className="col-span-3">Value Chain</div>
            <div className="col-span-1">Signals</div>
            <div className="col-span-1">Link</div>
          </div>

          {displayed.map((startup) => {
            const isExpanded = expandedSlug === startup.slug;
            return (
              <div
                key={startup.slug}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedSlug(isExpanded ? null : startup.slug)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left md:grid md:grid-cols-12 md:gap-3 md:items-center"
                >
                  {/* Company name */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amadeus-accent/10 flex items-center justify-center text-amadeus-accent text-xs font-bold flex-shrink-0">
                      {startup.name.charAt(0)}
                    </div>
                    <p className="font-semibold text-amadeus-deep text-sm truncate">{startup.name}</p>
                  </div>

                  {/* Sub-category */}
                  <div className="col-span-2 hidden md:block">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {startup.subCategory}
                    </span>
                  </div>

                  {/* Funding */}
                  <div className="col-span-2 hidden md:block">
                    <span className={`text-sm font-semibold ${startup.totalFunding === "Undisclosed" ? "text-gray-300" : "text-amadeus-deep"}`}>
                      {startup.totalFunding}
                    </span>
                  </div>

                  {/* Value chain */}
                  <div className="col-span-3 hidden md:flex gap-1 flex-wrap">
                    {startup.valueChainTargets.slice(0, 3).map((vc) => (
                      <span key={vc} className="text-[10px] bg-amadeus-accent/10 text-amadeus-accent px-1.5 py-0.5 rounded-full">
                        {vc}
                      </span>
                    ))}
                  </div>

                  {/* Signals count */}
                  <div className="col-span-1 hidden md:block">
                    <span className="text-xs text-gray-400">{startup.signalCount}</span>
                  </div>

                  {/* Link + expand */}
                  <div className="col-span-1 flex items-center gap-2">
                    {startup.website && (
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-amadeus-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={14} />
                      </a>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </div>

                  {/* Mobile: show key info inline */}
                  <div className="flex items-center gap-2 md:hidden">
                    <span className="text-xs font-semibold text-amadeus-deep">{startup.totalFunding}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{startup.subCategory}</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">What they do</p>
                        <p className="text-sm text-gray-700">{startup.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Funding</p>
                        <p className="text-sm text-gray-700">
                          {startup.totalFunding !== "Undisclosed"
                            ? `${startup.totalFunding} (latest: ${startup.latestRound})`
                            : "Undisclosed"}
                        </p>
                        {startup.website && (
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amadeus-accent hover:underline flex items-center gap-1 mt-1"
                          >
                            <Globe size={10} /> {startup.website.replace("https://", "")}
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Value Chain Targets</p>
                        <div className="flex gap-1 flex-wrap">
                          {startup.valueChainTargets.map((vc) => (
                            <span
                              key={vc}
                              className="text-xs bg-amadeus-accent/10 text-amadeus-accent px-2 py-0.5 rounded-full font-medium"
                            >
                              {vc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                        Related Signals ({startup.signalCount})
                      </p>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {startup.signals.map((signal) => (
                          <div key={signal.id} className="flex items-start gap-2 text-sm">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${impactColors[signal.impact]}`}
                            >
                              {signal.impact}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 text-sm leading-snug">{signal.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {signal.source} ·{" "}
                                {(() => {
                                  try {
                                    return formatDistanceToNow(new Date(signal.date), { addSuffix: true });
                                  } catch {
                                    return signal.date;
                                  }
                                })()}
                              </p>
                            </div>
                            {signal.link && (
                              <a
                                href={signal.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-amadeus-accent flex-shrink-0"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
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
      )}
    </div>
  );
}
