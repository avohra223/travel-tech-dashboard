import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-amadeus-accent",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div
        className={`p-3 rounded-lg bg-amadeus-accent/10 ${color}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-amadeus-deep">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
