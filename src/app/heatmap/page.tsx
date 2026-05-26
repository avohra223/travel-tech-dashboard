"use client";

import { useMemo, useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  MapPin,
  DollarSign,
  Target,
  Layers,
  Building2,
  Globe2,
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
  signalCount: number;
  website: string;
  description: string;
  companyType: string;
};

type Archetype = { name: string; count: number; companies: Company[] };

const ARCHETYPES: Archetype[] = landscapeData.archetypes as Archetype[];
const ALL_COMPANIES: Company[] = ARCHETYPES.flatMap((a) => a.companies);

// -- Axes --------------------------------------------------------------------

const VALUE_CHAIN_LAYERS = [
  "Discovery",
  "Aggregation",
  "Booking",
  "Servicing",
  "Payments",
  "Settlement",
];

const BUSINESS_UNITS = [
  "Distribution",
  "Airline IT",
  "Corporate Travel",
  "Hospitality",
  "Payments",
  "Airport Ops",
  "Data & Identity",
];

// Sub-category → Amadeus Business Unit it most directly threatens.
// Keys are normalised (trimmed, lowercased) for resilience.
const SUBCAT_TO_BU: Record<string, string> = {
  "hotel & hospitality tech": "Hospitality",
  "hospitality tech / pms": "Hospitality",
  "vacation rental": "Hospitality",
  "airline tech": "Airline IT",
  "ndc & airline retailing": "Airline IT",
  "airline tech / revenue mgmt": "Airline IT",
  "airline tech / disruption mgmt": "Airline IT",
  "revenue mgmt / pricing": "Airline IT",
  "airline & airport ops": "Airport Ops",
  "corporate travel tech": "Corporate Travel",
  "corporate travel": "Corporate Travel",
  "corporate travel / ai": "Corporate Travel",
  "travel risk & duty of care": "Corporate Travel",
  "booking & marketplace": "Distribution",
  "ota / distribution": "Distribution",
  "distribution & apis": "Distribution",
  "search & discovery": "Distribution",
  "ai travel assistants": "Distribution",
  "gds / travel-tech incumbent": "Distribution",
  "big tech": "Distribution",
  "ai lab": "Distribution",
  "e-commerce / super-app": "Distribution",
  "super-app": "Distribution",
  "ai / automation": "Distribution",
  "travel servicing / refunds": "Distribution",
  "tour operator tech": "Distribution",
  "other travel tech": "Distribution",
  "neobank / fintech": "Payments",
  "travel fintech": "Payments",
  payments: "Payments",
  fintech: "Payments",
  "fintech / bnpl": "Payments",
  "fintech / payments": "Payments",
  "mobility & ground transport": "Airport Ops",
  "ground transport": "Airport Ops",
  "airport & ground tech": "Airport Ops",
  "identity & travel documents": "Data & Identity",
  "visa & travel docs": "Data & Identity",
  "travel ad-tech & analytics": "Data & Identity",
  "loyalty & commerce media": "Data & Identity",
  "travel data & analytics": "Data & Identity",
  "travel tech / b2b": "Data & Identity",
};

function companyToBU(c: Company): string {
  const key = (c.subCategory || "").trim().toLowerCase();
  return SUBCAT_TO_BU[key] || "Distribution";
}

// Country normalisation — collapse variants ("U.S.", "United States") into one
// canonical name so the geography heatmap doesn't fragment.
const COUNTRY_NORMALISE: Record<string, string> = {
  "united states": "USA",
  "united states of america": "USA",
  "u.s.": "USA",
  us: "USA",
  "united kingdom": "UK",
  "great britain": "UK",
  gb: "UK",
};
function normaliseCountry(s: string): string {
  const t = (s || "").trim();
  if (!t) return "";
  const key = t.toLowerCase();
  return COUNTRY_NORMALISE[key] || t;
}

// -- Page --------------------------------------------------------------------

const TABS = [
  {
    key: "vc",
    label: "Booking Journey",
    icon: Layers,
    sub: "Where in the trip-booking journey each type of competitor attacks",
    rowAxis: "Competitor archetype",
    colAxis: "Stage of the booking journey",
    explanation:
      "Travel happens in stages — from researching a trip ('Discovery'), through aggregating options, booking, post-trip servicing, taking payment, and finally settling money between airlines and agents. Each cell shows how many companies in a given competitor archetype are active at that stage.",
    exampleTemplate: (sample: { row: string; col: string; n: number }) =>
      `Example: "${sample.row} × ${sample.col} = ${sample.n}" means ${sample.n} compan${
        sample.n === 1 ? "y" : "ies"
      } in the ${sample.row} archetype operate at the ${sample.col} stage.`,
  },
  {
    key: "bu",
    label: "Amadeus Businesses",
    icon: Building2,
    sub: "Which of Amadeus's product lines each competitor archetype puts at risk",
    rowAxis: "Competitor archetype",
    colAxis: "Amadeus business unit",
    explanation:
      "Amadeus runs several distinct businesses (Airline IT, Distribution / GDS, Corporate Travel, Hospitality, Payments, Airport Operations, Data & Identity). Each cell shows how many competitors in that archetype directly threaten that Amadeus business.",
    exampleTemplate: (sample: { row: string; col: string; n: number }) =>
      `Example: "${sample.row} × ${sample.col} = ${sample.n}" means ${sample.n} compan${
        sample.n === 1 ? "y" : "ies"
      } in the ${sample.row} archetype directly threaten Amadeus's ${sample.col} business.`,
  },
  {
    key: "geo",
    label: "Geography",
    icon: Globe2,
    sub: "Which countries each kind of threat is coming out of",
    rowAxis: "Competitor archetype",
    colAxis: "Headquarters country",
    explanation:
      "Each cell shows how many companies of a given archetype are headquartered in a given country. Useful for spotting regional clusters (e.g. Israeli airline-tech, Indian distribution platforms) and for partnership / acquisition planning.",
    exampleTemplate: (sample: { row: string; col: string; n: number }) =>
      `Example: "${sample.row} × ${sample.col} = ${sample.n}" means ${sample.n} compan${
        sample.n === 1 ? "y" : "ies"
      } in the ${sample.row} archetype are headquartered in ${sample.col}.`,
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function HeatmapPage() {
  const [tab, setTab] = useState<TabKey>("vc");
  const [selectedCell, setSelectedCell] = useState<{
    row: string;
    col: string;
    companies: Company[];
  } | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedCell ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCell]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCell(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset cell selection when tab changes
  useEffect(() => {
    setSelectedCell(null);
  }, [tab]);

  // -- Build the three matrices ---------------------------------------------

  const matrices = useMemo(() => {
    const archetypeNames = ARCHETYPES.map((a) => a.name);

    // Helper: build a matrix given a row key, column extractor function (which
    // can return multiple values), and the column list.
    const build = (
      rows: string[],
      cols: string[],
      extractCols: (c: Company) => string[],
      rowOf: (c: Company) => string
    ) => {
      const cells: Record<string, Record<string, Company[]>> = {};
      rows.forEach((r) => {
        cells[r] = {};
        cols.forEach((c) => (cells[r][c] = []));
      });
      ALL_COMPANIES.forEach((co) => {
        const r = rowOf(co);
        if (!cells[r]) return;
        extractCols(co).forEach((cl) => {
          if (cells[r][cl]) cells[r][cl].push(co);
        });
      });
      return { rows, cols, cells };
    };

    // Value Chain matrix: archetype × value chain layer
    const vc = build(
      archetypeNames,
      VALUE_CHAIN_LAYERS,
      (c) =>
        (c.valueChainTargets || "")
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean),
      (c) => c.archetype
    );

    // BU matrix: archetype × Amadeus business unit
    const bu = build(
      archetypeNames,
      BUSINESS_UNITS,
      (c) => [companyToBU(c)],
      (c) => c.archetype
    );

    // Geography: archetype × top countries
    const countryCounts: Record<string, number> = {};
    ALL_COMPANIES.forEach((c) => {
      const cn = normaliseCountry(c.hq);
      if (!cn) return;
      countryCounts[cn] = (countryCounts[cn] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k);
    const geo = build(
      archetypeNames,
      topCountries,
      (c) => {
        const cn = normaliseCountry(c.hq);
        return cn ? [cn] : [];
      },
      (c) => c.archetype
    );

    return { vc, bu, geo };
  }, []);

  const active =
    tab === "vc" ? matrices.vc : tab === "bu" ? matrices.bu : matrices.geo;

  // Compute max for color scale
  const maxCount = useMemo(() => {
    let m = 0;
    active.rows.forEach((r) =>
      active.cols.forEach((c) => {
        m = Math.max(m, active.cells[r][c].length);
      })
    );
    return m;
  }, [active]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#0a0e27] via-[#0d1635] to-[#000208] text-white">
      {/* Header */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Competitive Heatmap
        </h1>
        <p className="text-sm text-white/70 mt-1 max-w-3xl">
          A bird&apos;s-eye view of the {ALL_COMPANIES.length} companies competing
          with Amadeus. Pick a lens below — each one slices the same companies a
          different way. Brighter cells mean more competitors clustered there.
        </p>

        {/* Tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`group flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-lg border transition-all ${
                  isActive
                    ? "bg-white text-black border-white shadow-lg"
                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="text-sm font-semibold">{t.label}</span>
                </div>
                <span
                  className={`text-[10px] leading-tight ${
                    isActive ? "text-black/60" : "text-white/45"
                  }`}
                >
                  {t.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Explainer card — adapts per tab */}
        <Explainer matrix={active} tabKey={tab} />

        {/* Heatmap grid */}
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 md:p-6 overflow-x-auto">
          <HeatmapGrid
            rows={active.rows}
            cols={active.cols}
            cells={active.cells}
            maxCount={maxCount}
            rowAxis={TABS.find((t) => t.key === tab)!.rowAxis}
            colAxis={TABS.find((t) => t.key === tab)!.colAxis}
            onCellClick={(row, col, companies) =>
              companies.length > 0 && setSelectedCell({ row, col, companies })
            }
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
          <span>Fewer companies</span>
          <div className="flex h-3 rounded overflow-hidden border border-white/10">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="w-6 h-3"
                style={{ backgroundColor: heatColor(i / 9, 1) }}
              />
            ))}
          </div>
          <span>More companies</span>
          <span className="ml-auto text-white/50">
            Scale runs from 0 to {maxCount} companies per cell
          </span>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {topInsights(active, tab).map((insight) => (
            <div
              key={insight.label}
              className="rounded-xl bg-white/5 border border-white/10 p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                {insight.label}
              </p>
              <p className="text-base font-semibold text-white/90 leading-tight">
                {insight.value}
              </p>
              {insight.detail && (
                <p className="text-[11px] text-white/50 mt-0.5">{insight.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drawer */}
      {selectedCell && (
        <CellDrawer
          row={selectedCell.row}
          col={selectedCell.col}
          companies={selectedCell.companies}
          tabLabel={TABS.find((t) => t.key === tab)?.label || ""}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}

// -- Explainer card ----------------------------------------------------------

function Explainer({
  matrix,
  tabKey,
}: {
  matrix: {
    rows: string[];
    cols: string[];
    cells: Record<string, Record<string, Company[]>>;
  };
  tabKey: TabKey;
}) {
  const tab = TABS.find((t) => t.key === tabKey)!;

  // Pick a real, non-zero cell to anchor the example — prefer the hottest one
  // so the example feels meaningful, not arbitrary.
  const example = useMemo(() => {
    let best: { row: string; col: string; n: number } = {
      row: matrix.rows[0],
      col: matrix.cols[0],
      n: 0,
    };
    matrix.rows.forEach((r) =>
      matrix.cols.forEach((c) => {
        const n = matrix.cells[r][c].length;
        if (n > best.n) best = { row: r, col: c, n };
      })
    );
    return best;
  }, [matrix]);

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="grid md:grid-cols-3 gap-5 md:gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
            What this shows
          </p>
          <p className="text-sm text-white/85 leading-relaxed">
            {tab.explanation}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
            How to read a cell
          </p>
          <ul className="text-sm text-white/85 leading-relaxed space-y-1">
            <li>
              <span className="text-white/50">↓ Rows:</span>{" "}
              <span className="font-medium">{tab.rowAxis}</span>
            </li>
            <li>
              <span className="text-white/50">→ Columns:</span>{" "}
              <span className="font-medium">{tab.colAxis}</span>
            </li>
            <li>
              <span className="text-white/50">Number in cell:</span> count of
              companies at that intersection
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
            Worked example
          </p>
          <p className="text-sm text-white/85 leading-relaxed">
            {tab.exampleTemplate(example)}
          </p>
        </div>
      </div>
    </div>
  );
}

// -- Heatmap grid ------------------------------------------------------------

function HeatmapGrid({
  rows,
  cols,
  cells,
  maxCount,
  rowAxis,
  colAxis,
  onCellClick,
}: {
  rows: string[];
  cols: string[];
  cells: Record<string, Record<string, Company[]>>;
  maxCount: number;
  rowAxis: string;
  colAxis: string;
  onCellClick: (row: string, col: string, companies: Company[]) => void;
}) {
  // Pre-compute totals so the user sees the "shape" of each axis at a glance.
  const rowTotals: Record<string, number> = {};
  rows.forEach((r) => {
    rowTotals[r] = cols.reduce((acc, c) => acc + cells[r][c].length, 0);
  });
  const colTotals: Record<string, number> = {};
  cols.forEach((c) => {
    colTotals[c] = rows.reduce((acc, r) => acc + cells[r][c].length, 0);
  });

  const gridCols = `220px repeat(${cols.length}, minmax(80px, 1fr))`;

  return (
    <div className="min-w-[640px]">
      {/* Axis label row */}
      <div
        className="grid items-end gap-1.5 mb-1"
        style={{ gridTemplateColumns: gridCols }}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 pr-3">
          ↓ {rowAxis}
        </div>
        <div
          className="text-[10px] font-bold uppercase tracking-wider text-white/40 text-center"
          style={{ gridColumn: `span ${cols.length}` }}
        >
          → {colAxis}
        </div>
      </div>

      {/* Column headers with totals */}
      <div
        className="grid items-end gap-1.5 mb-1.5"
        style={{ gridTemplateColumns: gridCols }}
      >
        <div />
        {cols.map((c) => (
          <div
            key={c}
            className="text-[11px] md:text-xs font-semibold text-white/80 text-center px-1 leading-tight"
          >
            {c}
            <div className="text-[9px] text-white/40 font-normal mt-0.5">
              {colTotals[c]} total
            </div>
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, rIdx) => (
        <div
          key={row}
          className="grid items-stretch gap-1.5 mb-1.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="flex items-center pr-3 text-xs md:text-sm font-semibold text-white/85 leading-tight">
            <span className="truncate">{row}</span>
            <span className="ml-2 shrink-0 text-[10px] text-white/45 font-normal">
              {rowTotals[row]} total
            </span>
          </div>
          {cols.map((col) => {
            const companies = cells[row][col];
            const n = companies.length;
            const intensity = maxCount > 0 ? n / maxCount : 0;
            return (
              <button
                key={col}
                onClick={() => onCellClick(row, col, companies)}
                disabled={n === 0}
                className="group relative rounded-lg border border-white/10 aspect-[5/4] md:aspect-[3/2] transition-all duration-150 hover:scale-[1.04] hover:z-10 hover:border-white/50 disabled:cursor-default disabled:hover:scale-100 disabled:hover:border-white/10 overflow-hidden"
                style={{
                  backgroundColor: heatColor(intensity, n === 0 ? 0 : 1),
                  animationDelay: `${rIdx * 40}ms`,
                }}
                title={
                  n === 0
                    ? `${row} × ${col} — no companies`
                    : `${row} × ${col} — ${n} compan${
                        n === 1 ? "y" : "ies"
                      } (click for details)`
                }
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center px-2 py-1">
                  <span
                    className={`text-xl md:text-2xl font-bold ${
                      intensity > 0.55 ? "text-white" : "text-white/90"
                    } drop-shadow`}
                  >
                    {n || ""}
                  </span>
                </div>
                {/* Hover preview of company names */}
                {n > 0 && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm flex flex-col items-start justify-start p-2 overflow-hidden">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/60 mb-0.5">
                      {n} compan{n === 1 ? "y" : "ies"} — click for details
                    </p>
                    <div className="text-[10px] text-white/90 leading-tight space-y-0.5 overflow-hidden">
                      {companies.slice(0, 6).map((c) => (
                        <div key={c.name} className="truncate">
                          {c.name}
                        </div>
                      ))}
                      {companies.length > 6 && (
                        <div className="text-white/50 italic">
                          +{companies.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// -- Color scale -------------------------------------------------------------

// Sequential perceptual scale tuned for dark backgrounds. Goes from a deep
// indigo at low intensity, through magenta, to hot orange/yellow at max.
function heatColor(t: number, alpha: number): string {
  if (alpha === 0) return "rgba(255,255,255,0.025)";
  // Stops: 0 indigo → 0.33 magenta → 0.66 orange → 1 yellow
  const stops = [
    { t: 0, r: 25, g: 30, b: 90 },
    { t: 0.25, r: 88, g: 28, b: 135 }, // purple-900
    { t: 0.5, r: 190, g: 24, b: 93 }, // pink-700
    { t: 0.75, r: 234, g: 88, b: 12 }, // orange-600
    { t: 1, r: 250, g: 204, b: 21 }, // amber-400
  ];
  // Find segment
  let i = 0;
  while (i < stops.length - 1 && t > stops[i + 1].t) i++;
  const a = stops[i];
  const b = stops[Math.min(stops.length - 1, i + 1)];
  const span = Math.max(0.0001, b.t - a.t);
  const local = (t - a.t) / span;
  const r = Math.round(a.r + (b.r - a.r) * local);
  const g = Math.round(a.g + (b.g - a.g) * local);
  const bl = Math.round(a.b + (b.b - a.b) * local);
  // Min visibility: bump alpha based on t so a cell with t=0.05 still reads.
  const finalAlpha = 0.35 + 0.55 * t;
  return `rgba(${r},${g},${bl},${finalAlpha})`;
}

// -- Summary stats -----------------------------------------------------------

function topInsights(
  matrix: {
    rows: string[];
    cols: string[];
    cells: Record<string, Record<string, Company[]>>;
  },
  tabKey: TabKey
) {
  // Hottest cell
  let hot = { row: "", col: "", count: 0 };
  matrix.rows.forEach((r) =>
    matrix.cols.forEach((c) => {
      const n = matrix.cells[r][c].length;
      if (n > hot.count) hot = { row: r, col: c, count: n };
    })
  );

  const rowTotals = matrix.rows.map((r) => ({
    row: r,
    total: matrix.cols.reduce(
      (acc, c) => acc + matrix.cells[r][c].length,
      0
    ),
  }));
  const topRow = [...rowTotals].sort((a, b) => b.total - a.total)[0];

  const colTotals = matrix.cols.map((c) => ({
    col: c,
    total: matrix.rows.reduce(
      (acc, r) => acc + matrix.cells[r][c].length,
      0
    ),
  }));
  const topCol = [...colTotals].sort((a, b) => b.total - a.total)[0];

  const total = matrix.rows.length * matrix.cols.length;
  const empty = matrix.rows.reduce(
    (acc, r) =>
      acc +
      matrix.cols.filter((c) => matrix.cells[r][c].length === 0).length,
    0
  );

  // Tab-specific labels — plain English, no jargon
  const labels: Record<
    TabKey,
    { biggestCluster: string; topRow: string; topCol: string }
  > = {
    vc: {
      biggestCluster: "Biggest cluster",
      topRow: "Most active archetype",
      topCol: "Busiest booking stage",
    },
    bu: {
      biggestCluster: "Biggest threat cluster",
      topRow: "Most active archetype",
      topCol: "Amadeus business under most pressure",
    },
    geo: {
      biggestCluster: "Densest country–archetype",
      topRow: "Most active archetype",
      topCol: "Country with most competitors",
    },
  };

  const l = labels[tabKey];

  return [
    {
      label: l.biggestCluster,
      value: `${hot.row} × ${hot.col}`,
      detail: `${hot.count} compan${hot.count === 1 ? "y" : "ies"} packed in one cell`,
    },
    {
      label: l.topRow,
      value: topRow?.row || "—",
      detail: `${topRow?.total || 0} companies across all columns`,
    },
    {
      label: l.topCol,
      value: topCol?.col || "—",
      detail: `${topCol?.total || 0} companies across all archetypes`,
    },
    {
      label: "Cells with activity",
      value: `${total - empty} of ${total}`,
      detail: `${Math.round(((total - empty) / total) * 100)}% of intersections have at least one competitor`,
    },
  ];
}

// -- Drawer ------------------------------------------------------------------

function CellDrawer({
  row,
  col,
  companies,
  tabLabel,
  onClose,
}: {
  row: string;
  col: string;
  companies: Company[];
  tabLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out" }}
        onClick={onClose}
      />
      <div
        className="relative ml-auto w-full md:w-[640px] lg:w-[780px] h-full bg-gradient-to-b from-[#0a0e27] to-[#000208] border-l border-white/10 shadow-2xl overflow-y-auto"
        style={{ animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div
          className="sticky top-0 z-10 px-6 py-5 border-b border-white/10 backdrop-blur"
          style={{ backgroundColor: "rgba(10,14,39,0.85)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                {tabLabel} heatmap
              </p>
              <h2 className="text-lg md:text-xl font-bold leading-tight">
                {row}{" "}
                <span className="text-white/40 mx-1">×</span> {col}
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {companies.length} compan{companies.length === 1 ? "y" : "ies"} in
                this intersection
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {companies
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <CompanyMiniCard key={c.name} company={c} />
            ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(40px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function CompanyMiniCard({ company }: { company: Company }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 p-4 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{company.name}</h3>
            {company.companyType && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                {company.companyType}
              </span>
            )}
          </div>
          {company.subCategory && (
            <p className="text-xs text-white/50 mt-0.5">
              {company.subCategory} · {company.archetype}
            </p>
          )}
        </div>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Open website"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-white/70 mb-2">
        {company.hq && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-white/40" />
            {company.hq}
          </span>
        )}
        {company.totalFunding && (
          <span className="inline-flex items-center gap-1">
            <DollarSign size={12} className="text-white/40" />
            {company.totalFunding}
          </span>
        )}
        {company.valueChainTargets && (
          <span className="inline-flex items-center gap-1">
            <Target size={12} className="text-white/40" />
            {company.valueChainTargets}
          </span>
        )}
      </div>
      {company.whatTheyDo && (
        <p className="text-sm text-white/80 leading-relaxed">
          {open ? company.whatTheyDo : truncate(company.whatTheyDo, 220)}
        </p>
      )}
      {company.impactOnAmadeus && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-2 text-xs font-medium text-white/60 hover:text-white"
          >
            {open ? "Show less" : "Show impact on Amadeus →"}
          </button>
          {open && (
            <div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                Impact on Amadeus value chain
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {company.impactOnAmadeus}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}
