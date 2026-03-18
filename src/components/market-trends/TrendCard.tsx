import type { MarketTrend } from "@/lib/types";
import ImpactRating from "@/components/ui/ImpactRating";
import TagBadge from "@/components/ui/TagBadge";
import { Clock, BookOpen } from "lucide-react";

export default function TrendCard({ entry }: { entry: MarketTrend }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-amadeus-deep text-base">
            {entry.title}
          </h3>
          <span className="text-xs text-gray-500">{entry.category}</span>
        </div>
        <ImpactRating rating={entry.impactRating} />
      </div>

      <p className="text-sm text-gray-600 mb-3">{entry.description}</p>

      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{entry.timeline}</span>
        </div>
        {entry.sources.length > 0 && (
          <div className="flex items-center gap-1">
            <BookOpen size={12} />
            <span>{entry.sources.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 pt-3 border-t border-gray-50">
        {entry.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </div>
  );
}
