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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredSignals();
    setSignals(stored);
    setLastRefreshState(getLastRefresh());
  }, []);

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
