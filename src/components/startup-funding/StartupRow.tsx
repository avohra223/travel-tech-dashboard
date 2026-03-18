import type { StartupFunding } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import TagBadge from "@/components/ui/TagBadge";
import { ExternalLink } from "lucide-react";

export default function StartupRow({ entry }: { entry: StartupFunding }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-semibold text-sm text-amadeus-deep">
              {entry.name}
            </p>
            <p className="text-xs text-gray-500">{entry.headquarters}</p>
          </div>
          {entry.website && (
            <a
              href={entry.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amadeus-accent"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-gray-600 max-w-xs">{entry.description}</p>
      </td>
      <td className="py-3 px-4">
        <span className="font-semibold text-sm text-amadeus-deep">
          {formatCurrency(entry.fundingAmount)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs bg-amadeus-accent/10 text-amadeus-accent px-2 py-1 rounded-full font-medium">
          {entry.fundingRound}
        </span>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-gray-600">
          {entry.investors.join(", ")}
        </p>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-gray-500">
          {formatDate(entry.announcedDate)}
        </span>
      </td>
    </tr>
  );
}
