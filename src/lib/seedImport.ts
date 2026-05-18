import type { Signal } from "./signals";

export interface SeedStartup {
  name: string;
  hq: string;
  subCategory: string;
  valueChain: string[];
  funding: string;
  description: string;
  website: string;
}

export interface SeedFile {
  _meta?: { description?: string; version?: string; lastUpdated?: string };
  startups: SeedStartup[];
}

/**
 * Convert a curated seed entry into a synthetic Signal that flows through
 * the existing classification + startup-repository pipeline. The entry is
 * tagged as a startup so buildStartupRepository() picks it up directly,
 * bypassing the regex-based name extraction (we already know the name).
 */
export function seedToSignal(seed: SeedStartup, source: string): Signal {
  // Construct a title that looks like a funding announcement so the existing
  // extractFunding() in startupRepository.ts can pull the funding number,
  // and so the title reads naturally in the signals list.
  const fundingPhrase =
    seed.funding && seed.funding !== "Undisclosed" && seed.funding !== "Private"
      ? `has raised ${seed.funding}`
      : "is an active travel tech company";
  const title = `${seed.name} ${fundingPhrase} — ${seed.subCategory}`;
  const id = `seed-${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return {
    id,
    title,
    link: seed.website || "",
    date: new Date().toISOString(),
    source,
    feedCategory: "startup",
    competitors: [],
    valueChainLayers: seed.valueChain,
    impact: "High",
    amadeusThreat: `${seed.subCategory} player — see full profile in Startup Repository`,
    description: seed.description,
    isStartup: true,
    startupName: seed.name,
  };
}

/**
 * Parse a CSV file body into seed startup entries. Expects header row with
 * any subset of: name, website, hq, subcategory, valuechain, funding, description.
 * Comma-separated; values containing commas should be double-quoted.
 * Multi-value cells (valueChain) use ";" as the internal separator.
 */
export function parseStartupCSV(csvText: string): { entries: SeedStartup[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { entries: [], errors: ["CSV must have a header row plus at least one data row"] };
  }

  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current.trim());
    return out;
  };

  const header = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, ""));
  const colIdx = (key: string) => header.findIndex((h) => h === key);
  const nameIdx = colIdx("name");
  if (nameIdx < 0) {
    return { entries: [], errors: ["CSV must include a 'name' column"] };
  }

  const entries: SeedStartup[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = parseRow(lines[r]);
    const name = cols[nameIdx]?.trim();
    if (!name) {
      errors.push(`Row ${r + 1}: missing name, skipped`);
      continue;
    }
    const website = cols[colIdx("website")] || cols[colIdx("url")] || "";
    const hq = cols[colIdx("hq")] || cols[colIdx("country")] || "";
    const subCategory = cols[colIdx("subcategory")] || cols[colIdx("category")] || "Other Travel Tech";
    const valueChainRaw = cols[colIdx("valuechain")] || "";
    const valueChain = valueChainRaw
      ? valueChainRaw.split(/[;|]/).map((v) => v.trim()).filter(Boolean)
      : [];
    const funding = cols[colIdx("funding")] || "Undisclosed";
    const description = cols[colIdx("description")] || `${name} — ${subCategory}`;

    entries.push({ name, hq, subCategory, valueChain, funding, description, website });
  }

  return { entries, errors };
}
