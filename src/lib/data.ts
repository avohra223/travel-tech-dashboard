import fs from "fs";
import path from "path";
import type {
  DataFile,
  Competitor,
  AiTool,
  MarketTrend,
  StartupFunding,
  BigTechNews,
} from "./types";

function readDataFile<T>(filename: string): DataFile<T> {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getCompetitors(): DataFile<Competitor> {
  return readDataFile<Competitor>("competitors.json");
}

export function getAiTools(): DataFile<AiTool> {
  return readDataFile<AiTool>("ai-tools.json");
}

export function getMarketTrends(): DataFile<MarketTrend> {
  return readDataFile<MarketTrend>("market-trends.json");
}

export function getStartupFunding(): DataFile<StartupFunding> {
  return readDataFile<StartupFunding>("startup-funding.json");
}

export function getBigTechNews(): DataFile<BigTechNews> {
  return readDataFile<BigTechNews>("big-tech-news.json");
}
