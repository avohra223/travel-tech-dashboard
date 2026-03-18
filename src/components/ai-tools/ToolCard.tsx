import type { AiTool } from "@/lib/types";
import ThreatBadge from "@/components/ui/ThreatBadge";
import TagBadge from "@/components/ui/TagBadge";
import { formatMonthYear } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default function ToolCard({ entry }: { entry: AiTool }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-amadeus-deep text-base">
            {entry.name}
          </h3>
          <span className="text-xs text-gray-500">
            {entry.provider} &middot; {entry.category}
          </span>
        </div>
        <ThreatBadge level={entry.disruptionLevel} label={`${entry.disruptionLevel.charAt(0).toUpperCase() + entry.disruptionLevel.slice(1)} Disruption`} />
      </div>

      <p className="text-sm text-gray-600 mb-3">{entry.description}</p>

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
          Travel Use Case
        </p>
        <p className="text-xs text-gray-600">{entry.travelUseCase}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex flex-wrap gap-1 items-center">
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          <span className="text-xs text-gray-400 ml-2">
            {formatMonthYear(entry.launchDate)}
          </span>
        </div>
        {entry.website && (
          <a
            href={entry.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amadeus-accent hover:underline"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
