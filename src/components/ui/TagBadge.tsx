"use client";

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

export default function TagBadge({
  tag,
  active = false,
  onClick,
  clickable = false,
}: TagBadgeProps) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors";
  const colors = active
    ? "bg-amadeus-accent text-white"
    : "bg-gray-100 text-gray-600";
  const hover = clickable
    ? "cursor-pointer hover:bg-amadeus-accent hover:text-white"
    : "";

  return (
    <span className={`${base} ${colors} ${hover}`} onClick={onClick}>
      {tag}
    </span>
  );
}
