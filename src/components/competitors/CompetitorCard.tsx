import type { Competitor } from "@/lib/types";
import ThreatBadge from "@/components/ui/ThreatBadge";
import TagBadge from "@/components/ui/TagBadge";
import { ExternalLink } from "lucide-react";

export default function CompetitorCard({ entry }: { entry: Competitor }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-amadeus-deep text-base">
            {entry.name}
          </h3>
          <span className="text-xs text-gray-500">{entry.category}</span>
        </div>
        <ThreatBadge level={entry.threatLevel} />
      </div>

      <p className="text-sm text-gray-600 mb-3">{entry.description}</p>

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
          AI Features
        </p>
        <ul className="space-y-1">
          {entry.aiFeatures.map((feature, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-amadeus-accent mt-0.5">&#8226;</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {entry.notes && (
        <p className="text-xs text-gray-400 italic mb-3">{entry.notes}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
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
