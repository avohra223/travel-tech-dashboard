import type { ThreatLevel } from "./types";

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case "high":
      return "bg-threat-high text-white";
    case "medium":
      return "bg-threat-medium text-white";
    case "low":
      return "bg-threat-low text-white";
  }
}

export function getThreatDotColor(level: ThreatLevel): string {
  switch (level) {
    case "high":
      return "bg-threat-high";
    case "medium":
      return "bg-threat-medium";
    case "low":
      return "bg-threat-low";
  }
}

export function getUniqueTags<T extends { tags: string[] }>(
  entries: T[]
): string[] {
  const tagSet = new Set<string>();
  entries.forEach((entry) => entry.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function filterBySearch<T>(
  entries: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return entries;
  const lower = query.toLowerCase();
  return entries.filter((entry) =>
    fields.some((field) => {
      const val = entry[field];
      if (typeof val === "string") return val.toLowerCase().includes(lower);
      if (Array.isArray(val))
        return val.some(
          (v) => typeof v === "string" && v.toLowerCase().includes(lower)
        );
      return false;
    })
  );
}

export function filterByTags<T extends { tags: string[] }>(
  entries: T[],
  activeTags: string[]
): T[] {
  if (activeTags.length === 0) return entries;
  return entries.filter((entry) =>
    activeTags.some((tag) => entry.tags.includes(tag))
  );
}
