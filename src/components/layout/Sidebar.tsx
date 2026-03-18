"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Workflow,
  Rocket,
  Database,
  TrendingUp,
  Newspaper,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/competitors", label: "Major Competitors", icon: Swords },
  { href: "/value-chain", label: "Value Chain", icon: Workflow },
  { href: "/ai-tools", label: "Startups & New Entrants", icon: Rocket },
  { href: "/startup-repository", label: "Startup Repository", icon: Database },
  { href: "/market-trends", label: "Market Trends", icon: TrendingUp },
  { href: "/big-tech-news", label: "General News", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-amadeus-deep text-white z-50
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col sidebar-scroll overflow-y-auto
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h1 className="text-lg font-bold tracking-wide">AMADEUS</h1>
            <p className="text-xs text-white/60 mt-0.5">
              AI Disruptions Tracker
            </p>
          </div>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-amadeus-accent text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Live Intelligence v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
