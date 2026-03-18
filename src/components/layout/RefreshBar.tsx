"use client";

import { useDashboard } from "@/lib/DashboardContext";
import { RefreshCw, Menu, Loader2, CheckCircle, Wifi } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface RefreshBarProps {
  onMenuClick: () => void;
}

export default function RefreshBar({ onMenuClick }: RefreshBarProps) {
  const { lastRefresh, isRefreshing, refreshResult, refresh } = useDashboard();
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (refreshResult) {
      setShowResult(true);
      const timer = setTimeout(() => setShowResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [refreshResult]);

  const lastRefreshText = lastRefresh
    ? `${formatDistanceToNow(new Date(lastRefresh))} ago`
    : "Never";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} className="text-amadeus-deep" />
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Wifi size={12} />
          <span>Last refreshed: {lastRefreshText}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showResult && refreshResult && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full animate-in">
            <CheckCircle size={12} />
            <span>
              {refreshResult.totalRelevant} new signals from{" "}
              {refreshResult.feedResults.filter((f) => f.count > 0).length} feeds
            </span>
          </div>
        )}

        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-amadeus-accent text-white text-sm font-medium rounded-lg
            hover:bg-amadeus-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Fetching feeds...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Refresh
            </>
          )}
        </button>
      </div>
    </header>
  );
}
