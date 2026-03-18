# Travel Tech AI Disruptions Dashboard

**Live:** [akhilvohra-traveltech.vercel.app](https://akhilvohra-traveltech.vercel.app)

A live competitive intelligence dashboard that scrapes 15+ travel, tech, and startup news sources from the internet, filters for AI and travel tech relevance, classifies signals by competitor, value chain layer, and impact level, and funnels them into an actionable view for travel distribution stakeholders.

## What it does

The dashboard continuously monitors the AI-driven disruption happening across the travel tech ecosystem. It answers five key questions:

1. **What happened this week?** — Real-time signal feed from RSS sources
2. **Who is most active?** — 13 tracked competitors ranked by signal frequency
3. **Where in the value chain?** — Heatmap across Discovery → Aggregation → Booking → Settlement → Servicing → Payments
4. **Which startups are emerging?** — 100+ travel tech startups auto-discovered and profiled
5. **What are the broader trends?** — Market trend detection from signal clusters

## How it works

```
User clicks "Refresh"
       │
       ▼
Fetch RSS feeds (15+ sources in parallel)
       │
       ▼
Parse XML → extract title, link, date, description
       │
       ▼
Filter: travel relevance + AI/disruption relevance
       │
       ▼
Classify: competitor tags, value chain layer, impact level
       │
       ▼
Deduplicate by title similarity
       │
       ▼
Store in localStorage (persists across sessions)
       │
       ▼
Render across all dashboard views
```

## Data sources

**Travel industry:** Skift, PhocusWire

**Tech / AI:** TechCrunch AI, The Verge, Ars Technica

**Startups:** Google News (travel tech startups, travel AI funding, GDS alternatives, hotel tech, airline tech, corporate travel tech)

**General:** Google News (AI travel disruption, NDC airline, sustainable travel, travel payments)

All feeds are fetched via a Next.js API route (`/api/feed`) that proxies RSS requests to avoid CORS issues.

## Dashboard sections

| Tab | What it shows |
|-----|--------------|
| **Overview** | KPI cards, recent signals, threat rankings, value chain heatmap |
| **Major Competitors** | 13 tracked companies (Google, OpenAI, Revolut, Booking, Expedia, Sabre, etc.) with expandable signal history |
| **Value Chain** | Interactive visualization — click any layer to see its signals |
| **Startups & New Entrants** | Startup news items filtered by value chain target |
| **Startup Repository** | Auto-built database of unique companies with funding, category, and website |
| **Market Trends** | Dynamic pattern detection from signal clusters |
| **General News** | Everything not tied to a tracked competitor, categorized by industry vertical |
| **Settings** | Manage RSS feeds, keywords, export/clear data |

## Tracked competitors

| Company | Category | Default Threat |
|---------|----------|---------------|
| Google | Big Tech | Critical |
| Revolut | Fintech | High |
| Booking Holdings | Travel Incumbent | High |
| Grab / Super-Apps | Super-App | High |
| Sabre Corporation | GDS Competitor | High |
| OpenAI / ChatGPT | AI Native | Elevated |
| Expedia Group | Travel Incumbent | Elevated |
| Travelport | GDS Competitor | Elevated |
| Apple | Big Tech | Moderate |
| Amazon | Big Tech | Moderate |
| Perplexity | AI Native | Moderate |
| Stripe | Commerce Infra | Moderate |
| Meta | Big Tech | Low |

Threat levels are dynamic — they downgrade automatically if no signals back them up.

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom Amadeus color theme
- **Icons:** Lucide React
- **RSS parsing:** Native DOMParser (browser XML parsing)
- **Storage:** localStorage for persistence
- **Deployment:** Vercel (auto-deploys on push)

## Local development

```bash
git clone https://github.com/avohra223/travel-tech-dashboard.git
cd travel-tech-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Refresh** to fetch live signals.

## Deployment

The dashboard auto-deploys to Vercel on every push to `main`. To deploy your own:

1. Fork this repo
2. Connect to [Vercel](https://vercel.com)
3. Deploy — Vercel auto-detects Next.js

## Built by

**Akhil Vohra** — [GitHub](https://github.com/avohra223)

Built with Claude Code.
