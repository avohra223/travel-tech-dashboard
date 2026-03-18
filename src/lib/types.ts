export type ThreatLevel = "high" | "medium" | "low";

export interface DataFile<T> {
  lastUpdated: string;
  entries: T[];
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  description: string;
  aiFeatures: string[];
  threatLevel: ThreatLevel;
  website: string;
  tags: string[];
  notes: string;
}

export interface AiTool {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  travelUseCase: string;
  disruptionLevel: ThreatLevel;
  launchDate: string;
  website: string;
  tags: string[];
}

export interface MarketTrend {
  id: string;
  title: string;
  description: string;
  impactRating: number;
  timeline: string;
  category: string;
  sources: string[];
  tags: string[];
}

export interface StartupFunding {
  id: string;
  name: string;
  description: string;
  fundingAmount: number;
  fundingRound: string;
  investors: string[];
  foundedYear: number;
  headquarters: string;
  website: string;
  tags: string[];
  announcedDate: string;
}

export interface BigTechNews {
  id: string;
  company: "Google" | "Amazon" | "Microsoft" | "Apple" | "Meta";
  headline: string;
  summary: string;
  date: string;
  category: string;
  sourceUrl: string;
  impactOnAmadeus: ThreatLevel;
  tags: string[];
}
