import type { ThreatLevel } from "@/lib/types";
import { getThreatColor } from "@/lib/utils";

interface ThreatBadgeProps {
  level: ThreatLevel;
  label?: string;
}

export default function ThreatBadge({ level, label }: ThreatBadgeProps) {
  const displayLabel = label || level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getThreatColor(level)}`}
    >
      {displayLabel}
    </span>
  );
}
