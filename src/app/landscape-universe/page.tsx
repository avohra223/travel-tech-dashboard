"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  ExternalLink,
  MapPin,
  DollarSign,
  Target,
  ArrowLeft,
  Building2,
  Sparkles,
} from "lucide-react";
import landscapeData from "../../../data/landscape-companies.json";

type Company = {
  name: string;
  archetype: string;
  subCategory: string;
  hq: string;
  totalFunding: string;
  latestRound: string;
  valueChainTargets: string;
  whatTheyDo: string;
  impactOnAmadeus: string;
  amadeusThreat: string;
  signalCount: number;
  website: string;
  description: string;
  companyType: string;
};

type Archetype = {
  name: string;
  count: number;
  companies: Company[];
};

const ARCHETYPE_STYLES: Record<
  string,
  { gradient: string; ring: string; glow: string; emoji: string; accent: string }
> = {
  "Hotel Distribution Stack": {
    gradient: "from-orange-400 via-orange-500 to-red-600",
    ring: "ring-orange-400/40",
    glow: "shadow-[0_0_60px_rgba(251,146,60,0.55)]",
    emoji: "🏨",
    accent: "#fb923c",
  },
  "GDS Architectural Alternatives": {
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    ring: "ring-blue-400/40",
    glow: "shadow-[0_0_60px_rgba(59,130,246,0.55)]",
    emoji: "🛰️",
    accent: "#3b82f6",
  },
  "AI-Native Corporate Distribution": {
    gradient: "from-violet-400 via-purple-500 to-fuchsia-600",
    ring: "ring-purple-400/40",
    glow: "shadow-[0_0_60px_rgba(168,85,247,0.55)]",
    emoji: "💼",
    accent: "#a855f7",
  },
  "AI Front Door": {
    gradient: "from-cyan-400 via-teal-500 to-emerald-500",
    ring: "ring-teal-400/40",
    glow: "shadow-[0_0_60px_rgba(45,212,191,0.55)]",
    emoji: "🤖",
    accent: "#2dd4bf",
  },
  "Agent and Travel Fintech": {
    gradient: "from-lime-400 via-green-500 to-emerald-600",
    ring: "ring-green-400/40",
    glow: "shadow-[0_0_60px_rgba(34,197,94,0.55)]",
    emoji: "💳",
    accent: "#22c55e",
  },
  "AI-Native Airline Operations": {
    gradient: "from-pink-400 via-rose-500 to-red-500",
    ring: "ring-rose-400/40",
    glow: "shadow-[0_0_60px_rgba(244,63,94,0.55)]",
    emoji: "✈️",
    accent: "#f43f5e",
  },
};

const DEFAULT_STYLE = {
  gradient: "from-slate-400 via-slate-500 to-slate-600",
  ring: "ring-slate-400/40",
  glow: "shadow-[0_0_60px_rgba(148,163,184,0.55)]",
  emoji: "🌑",
  accent: "#94a3b8",
};

export default function LandscapeUniversePage() {
  const archetypes = landscapeData.archetypes as Archetype[];
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Body scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = selectedCompany ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCompany]);

  // Escape: company modal first, then archetype focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedCompany) setSelectedCompany(null);
      else if (selectedArchetype) setSelectedArchetype(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCompany, selectedArchetype]);

  // Planet positions
  const planets = useMemo(() => {
    const radius = 38;
    const count = archetypes.length;
    const minCount = Math.min(...archetypes.map((a) => a.count));
    const maxCount = Math.max(...archetypes.map((a) => a.count));
    return archetypes.map((arc, i) => {
      const angleDeg = -90 + (360 / count) * i;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = 50 + radius * Math.cos(angleRad);
      const y = 50 + radius * Math.sin(angleRad);
      const sizePct =
        5.5 + ((arc.count - minCount) / Math.max(1, maxCount - minCount)) * 3.5;
      const style = ARCHETYPE_STYLES[arc.name] || DEFAULT_STYLE;
      return { arc, x, y, sizePct, style };
    });
  }, [archetypes]);

  const totalCompanies = landscapeData._meta.totalCompanies;

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#0a0e27] via-[#0d1635] to-[#000208] text-white overflow-hidden">
      <MovingStarfield />

      {/* Header */}
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {selectedArchetype ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedArchetype(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back to Universe
            </button>
            <div className="text-right">
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 justify-end">
                <span>{ARCHETYPE_STYLES[selectedArchetype.name]?.emoji}</span>
                {selectedArchetype.name}
              </h1>
              <p className="text-xs text-white/60">
                {selectedArchetype.count} companies — click any to see details
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
              The Amadeus Landscape Universe
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {totalCompanies} companies across {archetypes.length} archetypes orbiting
              Amadeus. Click any planet to explore the companies within.
            </p>
          </div>
        )}
      </div>

      {/* Universe area */}
      <div className="relative z-10 w-full" style={{ height: "min(82vh, 800px)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[900px] max-h-[900px] mx-auto">
            {/* Orbital rings — fade when an archetype is selected */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                selectedArchetype ? "opacity-0" : "opacity-100"
              }`}
            >
              <OrbitRing percent={76} />
              <OrbitRing percent={62} dashed />
              <OrbitRing percent={48} dashed />
            </div>

            {/* Company satellite orbital ring — appears in focus mode */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                selectedArchetype ? "opacity-100 delay-300" : "opacity-0"
              }`}
            >
              <OrbitRing percent={62} dashed />
            </div>

            {/* Amadeus Sun — shrinks + fades when an archetype is selected */}
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ${
                selectedArchetype
                  ? "opacity-0 scale-50 pointer-events-none"
                  : "opacity-100 scale-100"
              }`}
            >
              <AmadeusSun />
            </div>

            {/* Planets */}
            {planets.map(({ arc, x, y, sizePct, style }) => {
              const isSelected = selectedArchetype?.name === arc.name;
              const isOtherSelected = selectedArchetype && !isSelected;
              // When this planet is the selected one, animate it to the center.
              const finalX = isSelected ? 50 : x;
              const finalY = isSelected ? 50 : y;
              return (
                <button
                  key={arc.name}
                  onClick={() => {
                    if (selectedArchetype) {
                      // In focus mode: clicking the centered planet returns to universe
                      if (isSelected) setSelectedArchetype(null);
                      else setSelectedArchetype(arc);
                    } else {
                      setSelectedArchetype(arc);
                    }
                  }}
                  className={`absolute group focus:outline-none transition-all duration-700 ${
                    isOtherSelected
                      ? "opacity-0 scale-0 pointer-events-none"
                      : "opacity-100"
                  }`}
                  style={{
                    left: `${finalX}%`,
                    top: `${finalY}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: isSelected ? 30 : 15,
                  }}
                  aria-label={`Open ${arc.name} (${arc.count} companies)`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`
                        relative rounded-full bg-gradient-to-br ${style.gradient}
                        ${style.glow}
                        ring-2 ${style.ring}
                        transition-all duration-300
                        group-hover:scale-110 group-hover:brightness-110
                        cursor-pointer
                        flex items-center justify-center
                        ${!selectedArchetype ? "animate-[float_6s_ease-in-out_infinite]" : ""}
                      `}
                      style={{
                        width: isSelected
                          ? `clamp(110px, 14vw, 180px)`
                          : `clamp(60px, ${sizePct}vw, 140px)`,
                        height: isSelected
                          ? `clamp(110px, 14vw, 180px)`
                          : `clamp(60px, ${sizePct}vw, 140px)`,
                      }}
                    >
                      <span
                        className="text-3xl md:text-4xl drop-shadow-lg"
                        aria-hidden
                      >
                        {style.emoji}
                      </span>
                      <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                        {arc.count}
                      </span>
                    </div>
                    <div className="text-center max-w-[160px] md:max-w-[200px]">
                      <p
                        className={`font-semibold leading-tight ${
                          isSelected ? "text-sm md:text-base" : "text-xs md:text-sm"
                        }`}
                      >
                        {arc.name}
                      </p>
                      <p className="text-[10px] md:text-xs text-white/50 mt-0.5">
                        {arc.count} companies
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Company satellites — pop up around the focused planet */}
            {selectedArchetype && (
              <CompanySatellites
                archetype={selectedArchetype}
                style={ARCHETYPE_STYLES[selectedArchetype.name] || DEFAULT_STYLE}
                onSelect={setSelectedCompany}
              />
            )}
          </div>
        </div>
      </div>

      {/* Company detail modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          style={
            ARCHETYPE_STYLES[selectedCompany.archetype] || DEFAULT_STYLE
          }
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: var(--star-base-opacity, 0.4);
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes drift {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(var(--star-dx, 6px), var(--star-dy, -8px));
          }
          100% {
            transform: translate(0, 0);
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function AmadeusSun() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-300/30 via-amber-500/10 to-transparent w-[260px] h-[260px] blur-2xl animate-pulse" />
      <div
        className="
          relative rounded-full
          bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500
          shadow-[0_0_100px_rgba(251,191,36,0.7)]
          ring-4 ring-amber-300/30
          flex items-center justify-center
        "
        style={{ width: "clamp(110px, 14vw, 180px)", height: "clamp(110px, 14vw, 180px)" }}
      >
        <div className="text-center">
          <p className="text-white font-bold tracking-widest text-sm md:text-base drop-shadow-md">
            AMADEUS
          </p>
          <p className="text-[10px] md:text-xs text-white/80 mt-0.5">Travel Distribution</p>
        </div>
      </div>
    </div>
  );
}

function OrbitRing({ percent, dashed = false }: { percent: number; dashed?: boolean }) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
        dashed ? "border-dashed" : "border-solid"
      } border-white/10`}
      style={{ width: `${percent}%`, aspectRatio: "1 / 1" }}
    />
  );
}

function MovingStarfield() {
  // Deterministic pseudo-random for SSR/CSR consistency. Each star gets its own
  // drift vector + twinkle/drift durations so the field looks alive but no two
  // stars sync up.
  const stars = useMemo(() => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const out: Array<{
      left: number;
      top: number;
      size: number;
      baseOpacity: number;
      dx: number;
      dy: number;
      driftDur: number;
      twinkleDur: number;
      driftDelay: number;
      twinkleDelay: number;
    }> = [];
    for (let i = 0; i < 160; i++) {
      out.push({
        left: rand() * 100,
        top: rand() * 100,
        size: rand() * 2 + 0.6,
        baseOpacity: rand() * 0.5 + 0.25,
        dx: (rand() - 0.5) * 30, // -15px..15px
        dy: (rand() - 0.5) * 30,
        driftDur: 12 + rand() * 16, // 12..28s
        twinkleDur: 2 + rand() * 4, // 2..6s
        driftDelay: rand() * 8,
        twinkleDelay: rand() * 4,
      });
    }
    return out;
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          style={
            {
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: "9999px",
              backgroundColor: "white",
              "--star-base-opacity": s.baseOpacity,
              "--star-dx": `${s.dx}px`,
              "--star-dy": `${s.dy}px`,
              animation: `drift ${s.driftDur}s ease-in-out ${s.driftDelay}s infinite, twinkle ${s.twinkleDur}s ease-in-out ${s.twinkleDelay}s infinite`,
              opacity: s.baseOpacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function CompanySatellites({
  archetype,
  style,
  onSelect,
}: {
  archetype: Archetype;
  style: typeof DEFAULT_STYLE;
  onSelect: (c: Company) => void;
}) {
  const companies = archetype.companies;
  const count = companies.length;

  // Lay out companies in two concentric rings if there are many, to avoid
  // crowding. Up to 12 in an inner ring; the rest go on an outer ring.
  const useTwoRings = count > 12;
  const innerCount = useTwoRings ? Math.ceil(count / 2) : count;
  const innerRadius = useTwoRings ? 26 : 31;
  const outerRadius = 39;

  return (
    <>
      {companies.map((company, i) => {
        const onInner = !useTwoRings || i < innerCount;
        const indexInRing = onInner ? i : i - innerCount;
        const ringCount = onInner ? innerCount : count - innerCount;
        const radius = onInner ? innerRadius : outerRadius;
        const offset = onInner ? -90 : -90 + 180 / ringCount; // stagger outer ring
        const angleDeg = offset + (360 / ringCount) * indexInRing;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);

        // Decide which side of the dot the label sits on so labels radiate
        // outward and don't pile up against the centered planet.
        const labelOnRight = Math.cos(angleRad) > 0.15;
        const labelOnLeft = Math.cos(angleRad) < -0.15;
        const labelAlignCls = labelOnRight
          ? "left-full ml-2 text-left"
          : labelOnLeft
          ? "right-full mr-2 text-right"
          : "left-1/2 -translate-x-1/2 top-full mt-1 text-center";

        return (
          <button
            key={company.name}
            onClick={() => onSelect(company)}
            className="absolute group focus:outline-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              animation: `popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 35}ms both`,
              zIndex: 25,
            }}
            aria-label={`Show details for ${company.name}`}
          >
            <div className="relative">
              {/* Dot */}
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/40 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group-hover:scale-125 group-hover:border-white shadow-lg"
                style={{
                  backgroundColor: style.accent,
                  boxShadow: `0 0 16px ${style.accent}88`,
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {company.name
                    .replace(/[^A-Za-z0-9]/g, "")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              {/* Label */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${labelAlignCls} pointer-events-none whitespace-nowrap`}
              >
                <p className="text-[11px] md:text-xs font-medium text-white/90 leading-tight drop-shadow-md">
                  {truncate(company.name, 22)}
                </p>
                {company.totalFunding && (
                  <p className="text-[9px] text-white/50 leading-tight">
                    {company.totalFunding}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

function CompanyDetailModal({
  company,
  style,
  onClose,
}: {
  company: Company;
  style: typeof DEFAULT_STYLE;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        style={{ animation: "fadeIn 0.2s ease-out" }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#10183a] to-[#06081c] border border-white/10 shadow-2xl"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Coloured accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: style.accent }}
        />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-br ${style.gradient} ring-2 ${style.ring} flex items-center justify-center text-2xl`}
              >
                {style.emoji}
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">{company.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {company.subCategory && (
                    <span className="text-xs text-white/70">{company.subCategory}</span>
                  )}
                  {company.companyType && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                      {company.companyType}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick facts grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            {company.hq && (
              <Fact
                icon={<MapPin size={14} />}
                label="HQ"
                value={company.hq}
              />
            )}
            {company.totalFunding && (
              <Fact
                icon={<DollarSign size={14} />}
                label="Total funding"
                value={company.totalFunding}
              />
            )}
            {company.latestRound && company.latestRound !== company.totalFunding && (
              <Fact
                icon={<Sparkles size={14} />}
                label="Latest round"
                value={company.latestRound}
              />
            )}
            {company.valueChainTargets && (
              <Fact
                icon={<Target size={14} />}
                label="Value chain"
                value={company.valueChainTargets}
              />
            )}
            {company.archetype && (
              <Fact
                icon={<Building2 size={14} />}
                label="Archetype"
                value={company.archetype}
              />
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors col-span-2 md:col-span-1"
              >
                <ExternalLink size={14} className="text-white/60" />
                <span className="truncate">Visit website</span>
              </a>
            )}
          </div>

          {/* What they do */}
          {company.whatTheyDo && (
            <section className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                What they do / why interesting for Amadeus
              </h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {company.whatTheyDo}
              </p>
            </section>
          )}

          {/* Impact */}
          {company.impactOnAmadeus && (
            <section className="mb-5 p-4 rounded-xl bg-black/30 border border-white/5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                Impact on Amadeus value chain
              </h3>
              <p className="text-sm text-white/85 leading-relaxed">
                {company.impactOnAmadeus}
              </p>
            </section>
          )}

          {/* Latest signal headline */}
          {company.description && (
            <section className="mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                Most recent signal
              </h3>
              <p className="text-sm text-white/70 italic leading-relaxed">
                &ldquo;{company.description}&rdquo;
              </p>
              {company.signalCount > 0 && (
                <p className="text-xs text-white/40 mt-1">
                  {company.signalCount} total signal{company.signalCount > 1 ? "s" : ""} tracked
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">
        {icon}
        {label}
      </div>
      <p className="text-sm text-white/90 leading-tight">{value}</p>
    </div>
  );
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}
