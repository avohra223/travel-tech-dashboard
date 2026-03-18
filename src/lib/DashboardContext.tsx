"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Signal } from "./signals";
import { baselineSignals } from "./signals";
import { getStoredSignals, storeSignals, mergeSignals, getLastRefresh, setLastRefresh } from "./store";
import { fetchAllFeeds, type FetchResult } from "./fetchFeeds";

interface DashboardState {
  signals: Signal[];
  lastRefresh: string | null;
  isRefreshing: boolean;
  refreshResult: FetchResult | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardState>({
  signals: baselineSignals,
  lastRefresh: null,
  isRefreshing: false,
  refreshResult: null,
  refresh: async () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>(baselineSignals);
  const [lastRefresh, setLastRefreshState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<FetchResult | null>(null);

  // Load from localStorage on mount, auto-refresh if never refreshed
  useEffect(() => {
    const stored = getStoredSignals();
    setSignals(stored);
    const lr = getLastRefresh();
    setLastRefreshState(lr);

    // Auto-refresh on first visit (no cached data from live feeds)
    if (!lr) {
      // Small delay so the UI renders baseline data first
      const timer = setTimeout(() => {
        refresh();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshResult(null);
    try {
      const result = await fetchAllFeeds();
      const existing = getStoredSignals();
      const merged = mergeSignals(existing, result.signals);
      storeSignals(merged);
      setSignals(merged);
      setLastRefresh();
      setLastRefreshState(new Date().toISOString());
      setRefreshResult(result);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{ signals, lastRefresh, isRefreshing, refreshResult, refresh }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
