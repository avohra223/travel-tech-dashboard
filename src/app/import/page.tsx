"use client";

import { useState, useRef } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getStoredSignals, storeSignals, mergeSignals } from "@/lib/store";
import {
  seedToSignal,
  parseStartupCSV,
  type SeedStartup,
  type SeedFile,
} from "@/lib/seedImport";
import { Database, Upload, CheckCircle2, AlertCircle, Download } from "lucide-react";
import seedData from "../../../data/seed-startups.json";

type ImportResult = {
  source: string;
  attempted: number;
  added: number;
  alreadyPresent: number;
  errors: string[];
};

export default function ImportPage() {
  const { signals } = useDashboard();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importEntries = (entries: SeedStartup[], source: string): ImportResult => {
    const existing = getStoredSignals();
    const existingIds = new Set(existing.map((s) => s.id));
    const newSignals = entries
      .map((e) => seedToSignal(e, source))
      .filter((s) => !existingIds.has(s.id));
    const merged = mergeSignals(existing, newSignals);
    storeSignals(merged);
    return {
      source,
      attempted: entries.length,
      added: newSignals.length,
      alreadyPresent: entries.length - newSignals.length,
      errors: [],
    };
  };

  const handleSeedImport = () => {
    setRunning(true);
    try {
      const file = seedData as SeedFile;
      const res = importEntries(file.startups, "Seed Database");
      setResult(res);
      // Force a soft reload so the DashboardContext re-reads localStorage
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setRunning(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    setRunning(true);
    try {
      const text = await file.text();
      const { entries, errors } = parseStartupCSV(text);
      if (entries.length === 0) {
        setResult({
          source: `CSV: ${file.name}`,
          attempted: 0,
          added: 0,
          alreadyPresent: 0,
          errors: errors.length > 0 ? errors : ["No rows parsed"],
        });
        return;
      }
      const res = importEntries(entries, `CSV: ${file.name}`);
      res.errors = errors;
      setResult(res);
      setTimeout(() => window.location.reload(), 2000);
    } finally {
      setRunning(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template =
      "name,website,hq,subCategory,valueChain,funding,description\n" +
      'ExampleCo,https://example.com,USA,Hotel & Hospitality Tech,Servicing;Booking,$10M,An example startup\n' +
      'Other Startup,https://other.com,UK,Airline Tech,Aggregation,$25M,"Another, comma-safe description"\n';
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "startup-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const seedCount = (seedData as SeedFile).startups.length;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-amadeus-deep">Startup Import</h1>
        <p className="text-sm text-gray-500">
          Bulk-add startups to the repository. Imports merge with the existing data — duplicates
          (by name) are skipped. This page is not linked from the sidebar; bookmark{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/import</code> for direct access.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Seed import */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Database size={18} className="text-amadeus-accent" />
            <h2 className="font-semibold text-amadeus-deep">Curated Seed Database</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {seedCount} hand-curated travel-tech startups across every sub-category (Corporate
            Travel, Airline Tech, Hotel Tech, AI Assistants, Booking & Marketplace, Travel Fintech,
            Vacation Rental, Search & Discovery, Distribution & APIs, Tour Operator Tech, Airport &
            Ground, Data & Analytics). One click imports everything not already in your repository.
          </p>
          <button
            onClick={handleSeedImport}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-amadeus-accent text-white rounded-lg text-sm font-medium hover:bg-amadeus-deep transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <Database size={14} />
            {running ? "Importing…" : `Import seed (${seedCount} startups)`}
          </button>
        </div>

        {/* CSV upload */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Upload size={18} className="text-amadeus-accent" />
            <h2 className="font-semibold text-amadeus-deep">Import from CSV</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV of additional startups. Required column: <code>name</code>. Optional:{" "}
            <code>website</code>, <code>hq</code>, <code>subCategory</code>,{" "}
            <code>valueChain</code> (semicolon-separated), <code>funding</code>,{" "}
            <code>description</code>. Use the template below.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCSVUpload(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-amadeus-accent text-white rounded-lg text-sm font-medium hover:bg-amadeus-deep transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Upload size={14} />
              Choose CSV file
            </button>
            <button
              onClick={downloadCSVTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              <Download size={14} />
              Download template
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            {result.added > 0 ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <AlertCircle size={18} className="text-amber-600" />
            )}
            <h2 className="font-semibold text-amadeus-deep">Import complete: {result.source}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Attempted</p>
              <p className="text-lg font-semibold text-amadeus-deep">{result.attempted}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Added</p>
              <p className="text-lg font-semibold text-green-600">{result.added}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Already Present</p>
              <p className="text-lg font-semibold text-gray-500">{result.alreadyPresent}</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded text-xs text-amber-800">
              <p className="font-semibold mb-1">Notes:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {result.errors.length > 10 && <li>…and {result.errors.length - 10} more</li>}
              </ul>
            </div>
          )}
          {result.added > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              Page will refresh automatically. New startups will appear in the Startup Repository.
            </p>
          )}
        </div>
      )}

      {/* Current state */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p>
          <strong className="text-amadeus-deep">{signals.length}</strong> total signals currently
          in your repository. Imports are additive — your existing data is never deleted.
        </p>
      </div>
    </div>
  );
}
