"use client";

import { useState, useEffect } from "react";
import {
  getSettings, saveSettings, clearAllData, exportAllData, getFeedStats,
  type DashboardSettings, type FeedConfig, type FeedStatsSnapshot,
} from "@/lib/store";
import { Save, Trash2, Download, Plus, X, RotateCcw, BarChart3, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const feedCategories = ["travel", "tech", "startup", "general"] as const;
const categoryColors: Record<string, string> = {
  travel: "bg-blue-100 text-blue-700",
  tech: "bg-purple-100 text-purple-700",
  startup: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-700",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [feedStats, setFeedStats] = useState<FeedStatsSnapshot | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setFeedStats(getFeedStats());
  }, []);
  if (!settings) return null;

  // Build a lookup from feed name → stats for quick rendering
  const statsByName = new Map<string, FeedStatsSnapshot["perFeed"][number]>();
  for (const s of feedStats?.perFeed ?? []) statsByName.set(s.name, s);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFeed = () => {
    setSettings({
      ...settings,
      feeds: [...settings.feeds, { name: "", url: "", enabled: true, category: "general" }],
    });
  };

  const removeFeed = (index: number) => {
    setSettings({ ...settings, feeds: settings.feeds.filter((_, i) => i !== index) });
  };

  const updateFeed = (index: number, field: keyof FeedConfig, value: string | boolean) => {
    const feeds = [...settings.feeds];
    feeds[index] = { ...feeds[index], [field]: value } as FeedConfig;
    setSettings({ ...settings, feeds });
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amadeus-dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm("Delete all cached signals and settings?")) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      clearAllData();
      setSettings(getSettings());
    }
  };

  // Group feeds by category
  const grouped = feedCategories.map((cat) => ({
    category: cat,
    feeds: settings.feeds.map((f, i) => ({ ...f, index: i })).filter((f) => f.category === cat),
  }));

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-amadeus-deep">Settings</h1>
      <p className="text-sm text-gray-500">Manage RSS feeds, keywords, and data. Changes apply on next Refresh.</p>

      {/* Last refresh stats — per-feed diagnostic */}
      {feedStats && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-amadeus-accent" />
            <h2 className="font-semibold text-amadeus-deep">Last Refresh Stats</h2>
            <span className="text-xs text-gray-400">
              · {(() => {
                try { return formatDistanceToNow(new Date(feedStats.refreshedAt), { addSuffix: true }); }
                catch { return feedStats.refreshedAt; }
              })()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Items Fetched</p>
              <p className="text-lg font-semibold text-amadeus-deep">{feedStats.totalFetched}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Relevant After Filter</p>
              <p className="text-lg font-semibold text-amadeus-accent">{feedStats.totalRelevant}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Pass Rate</p>
              <p className="text-lg font-semibold text-amadeus-deep">
                {feedStats.totalFetched > 0
                  ? `${Math.round((feedStats.totalRelevant / feedStats.totalFetched) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Feeds With Errors</p>
              <p className="text-lg font-semibold text-red-500">
                {feedStats.perFeed.filter((f) => f.error).length}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Per-feed counts shown next to each feed below as <span className="font-mono">fetched / relevant</span>.
          </p>
        </div>
      )}

      {/* Feeds grouped by category */}
      {grouped.map(({ category, feeds }) => (
        <div key={category} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-amadeus-deep capitalize">{category} Feeds</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[category]}`}>{feeds.length}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {category === "travel" && "Inherently travel-relevant. Only needs AI/disruption signal to pass filter."}
            {category === "tech" && "Requires STRONG travel keywords to pass filter. General tech is rejected."}
            {category === "startup" && "Google News queries for travel tech startups. Needs travel connection."}
            {category === "general" && "General travel + AI news queries. Moderate filtering."}
          </p>
          <div className="space-y-2">
            {feeds.map((feed) => {
              const stat = statsByName.get(feed.name);
              return (
                <div key={feed.index} className="flex items-center gap-2">
                  <input type="checkbox" checked={feed.enabled} onChange={(e) => updateFeed(feed.index, "enabled", e.target.checked)} className="accent-amadeus-accent" />
                  <input type="text" value={feed.name} onChange={(e) => updateFeed(feed.index, "name", e.target.value)} placeholder="Name" className="w-40 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amadeus-accent" />
                  <input type="text" value={feed.url} onChange={(e) => updateFeed(feed.index, "url", e.target.value)} placeholder="URL" className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amadeus-accent font-mono text-xs" />
                  {/* Per-feed stats badge */}
                  {feedStats && (
                    stat?.error ? (
                      <span title={stat.error} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-red-50 text-red-600 whitespace-nowrap">
                        <AlertCircle size={10} /> error
                      </span>
                    ) : stat ? (
                      <span
                        title={`Fetched ${stat.count} items; ${stat.relevant} passed travel/disruption filter`}
                        className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap ${
                          stat.relevant === 0
                            ? "bg-gray-100 text-gray-400"
                            : stat.relevant / Math.max(stat.count, 1) >= 0.3
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {stat.count}/{stat.relevant}
                      </span>
                    ) : (
                      <span title="Not fetched in last refresh (disabled or newly added)" className="px-2 py-1 rounded text-[10px] font-mono bg-gray-50 text-gray-300 whitespace-nowrap">
                        —/—
                      </span>
                    )
                  )}
                  <select value={feed.category} onChange={(e) => updateFeed(feed.index, "category", e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded text-xs">
                    {feedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => removeFeed(feed.index)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={addFeed} className="flex items-center gap-1 text-sm text-amadeus-accent hover:underline">
        <Plus size={14} /> Add new feed
      </button>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-amadeus-accent text-white rounded-lg text-sm font-medium hover:bg-amadeus-deep transition-colors">
          <Save size={14} />{saved ? "Saved!" : "Save Settings"}
        </button>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          <Download size={14} />Export Data
        </button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          <RotateCcw size={14} />Reset Defaults
        </button>
        <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
          <Trash2 size={14} />Clear All Data
        </button>
      </div>
    </div>
  );
}
