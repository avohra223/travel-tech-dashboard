import type { BigTechNews } from "@/lib/types";
import ThreatBadge from "@/components/ui/ThreatBadge";
import TagBadge from "@/components/ui/TagBadge";
import { formatDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const companyColors: Record<string, string> = {
  Google: "bg-blue-50 text-blue-700 border-blue-200",
  Amazon: "bg-orange-50 text-orange-700 border-orange-200",
  Microsoft: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Apple: "bg-gray-50 text-gray-700 border-gray-200",
  Meta: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function NewsCard({ entry }: { entry: BigTechNews }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${companyColors[entry.company] || "bg-gray-50 text-gray-700"}`}
          >
            {entry.company}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(entry.date)}
          </span>
        </div>
        <ThreatBadge
          level={entry.impactOnAmadeus}
          label={`${entry.impactOnAmadeus.charAt(0).toUpperCase() + entry.impactOnAmadeus.slice(1)} Impact`}
        />
      </div>

      <h3 className="font-semibold text-amadeus-deep text-base mb-2">
        {entry.headline}
      </h3>

      <p className="text-sm text-gray-600 mb-3">{entry.summary}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {entry.category}
          </span>
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        {entry.sourceUrl && (
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amadeus-accent hover:underline text-xs flex items-center gap-1"
          >
            Source <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
