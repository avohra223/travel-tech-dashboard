"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  lastUpdated?: string;
  onMenuClick: () => void;
}

export default function Header({ title, lastUpdated, onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} className="text-amadeus-deep" />
        </button>
        <h1 className="text-xl font-bold text-amadeus-deep">{title}</h1>
      </div>
      {lastUpdated && (
        <span className="text-xs text-gray-400">
          Last updated: {lastUpdated}
        </span>
      )}
    </header>
  );
}
