// All resume content, in one place. Every number here was pulled from the
// workspace it describes (commit logs, config files, operations registries,
// and the data files themselves — never READMEs, which drift) on 2026-07-28.
// Update this file, redeploy, done.

export const PROFILE = {
  name: "Eric Backman",
  title: "Data Engineer & Applied AI, Agentic Systems",
  location: "Toronto, ON, Canada",
  email: "ericbackman81@gmail.com",
  github: "https://github.com/ericbackman",
  linkedin: "https://linkedin.com/in/ericbackman",
  website: "https://ericbackman.com",
  booking: "https://calendar.app.google/YUR2Cv6ayZyb8wXC8",
  summary:
    "Data engineer and applied AI builder in Toronto. At BMO he builds the data platform and multi-agent LLM pipelines behind FRTB regulatory capital investigations. At home he runs a 72-repository agentic workspace where Claude Code operates with real responsibility behind engineered guardrails: memory, review gates, playbooks, and a session-level trust score. This server is itself one of his projects.",
};

export interface Part {
  name: string;
  note: string;
  url?: string;
}

export interface Project {
  slug: string;
  name: string;
  oneLiner: string;
  description: string;
  status: string;
  tech: string[];
  numbers: string[];
  tags: string[];
  url?: string;
  /** Subprojects / components, shown on the landing map and in get_project. */
  parts?: Part[];
  /** Extra depth for get_project beyond the description. */
  detail?: string[];
}

// Curated to the most complete systems, verified against their own data files.
// Tag "agentic-ai" marks projects where AI agents do the operating, not just
// the authoring. Access-gated personal tools are deliberately not listed.
export const PROJECTS: Project[] = [
  {
    slug: "ai-resume",
    name: "This server (AI-native resume)",
    oneLiner: "The MCP server you are querying right now.",
    description:
      "A dependency-free Model Context Protocol server on a Cloudflare Worker. Serves Eric's resume as structured tools any AI assistant can call, plus a human landing page and llms.txt. The narrative resume it serves was written by Claude from inside Eric's workspace. It is the 4th MCP server he has built (after YouTube operations, the sports data platform, and his personal data platform).",
    status: "Live at ai.ericbackman.com",
    tech: ["TypeScript", "Cloudflare Workers", "MCP (Streamable HTTP)"],
    numbers: ["0 runtime dependencies", "9 tools", "14 unit tests"],
    tags: ["agentic-ai", "live"],
    url: "https://ai.ericbackman.com",
  },
  {
    slug: "content-studio",
    name: "Dive Shorts studio (YouTube)",
    oneLiner: "Tools that let Claude turn a pile of raw dive footage into a running YouTube channel.",
    description:
      "Claude takes Eric's raw 4K scuba footage and does the rest: reviews the clip library, defines each cut, color-corrects and reframes to a 9:16 Short in one ffmpeg pass, writes the title, uploads as private, and schedules the publish drip. Daily jobs keep the queue moving; a weekly channel-manager loop reads the analytics and preps what's next. Eric dives and approves. Long-form ambient videos ship through the same tools, with a 6-agent research, storyboard, and review crew behind the narrated ones.",
    status: "Live channel (youtube.com/@backmandiving), 5 scheduled jobs",
    tech: ["Python (stdlib render pipeline)", "ffmpeg", "YouTube Data + Analytics APIs", "Claude subagents"],
    numbers: ["111 videos uploaded", "74 Shorts public", "217-entry publish queue", "308 source clips catalogued"],
    tags: ["agentic-ai", "automated", "live"],
    url: "https://youtube.com/@backmandiving",
    parts: [
      { name: "footage intake", note: "catalogues the 4K clip library (308 clips) and defines each Short's cut" },
      { name: "editor", note: "trim, underwater color correction, 9:16 reframe, text overlays, one ffmpeg pass" },
      { name: "upload & schedule", note: "uploads as private, then drips publishes on a schedule" },
      { name: "analytics monitor", note: "daily velocity and playlist checks, flags feed misses" },
      { name: "long-form crew", note: "6 agents (research, storyboard, visuals, edit, adversarial review, management) for narrated long-form" },
      { name: "channel manager", note: "weekly loop: diagnose retention, prep the next video, hand Eric one decision" },
    ],
    detail: [
      "5 scheduled jobs run the pipeline: pre-render 07:00, upload 08:30, analytics monitor 09:00, weekly publish-drip scheduling, and a Sunday channel-manager checkpoint.",
      "Formats are greenlit on data: a 64-minute sleep-video pilot earned 19.6 watch-hours against 5.6 and 1.3 for its comparables, so the format shipped.",
      "The human gate is structural: scheduled jobs upload as private only. Nothing goes public without Eric's review.",
    ],
  },
  {
    slug: "agent-audit",
    name: "Agent reliability dashboard",
    oneLiner: "Scores every logged Claude Code session on how far it ran unattended.",
    description:
      "A global Stop hook logs every session; the dashboard turns the generation-to-verification loop into a 0-to-100 trust score. A needed human correction hard-caps a session at 60, because stepping in at all proves it wasn't safe to run alone. After a silent 8-day deploy freeze, the page gained a staleness guard so a frozen dashboard flags its own age instead of failing quietly.",
    status: "Live at loop.ericbackman.com (Access-gated), refreshed weekly by a scheduled job",
    tech: ["Python (stdlib, tested)", "Cloudflare Workers", "Cloudflare Access", "hand-rolled SVG charts"],
    numbers: [
      "289 logged sessions across 39 projects",
      "25,610 tool calls and 5,427 files changed measured",
      "average trust 81/100, correction rate 0.21",
    ],
    tags: ["agentic-ai", "live", "automated"],
    url: "https://loop.ericbackman.com",
    detail: [
      "Data source is a deterministic global Stop hook that appends one JSON line per session; the dashboard is a tested stdlib-Python build over that log.",
      "The rubric is versioned (v1-hardcap) so scores stay comparable as it evolves.",
      "Built explicitly to speed up the generation-to-verification loop, the slowest axis of running agents with real responsibility.",
    ],
  },
  {
    slug: "paper-trader",
    name: "Agentic paper trader",
    oneLiner: "Claude runs a trading session every weekday morning and publishes its reasoning.",
    description:
      "Every weekday at 9:45 Claude reviews the portfolio through Alpaca's paper API, places trades, and writes its reasoning. A Cloudflare Worker renders the last 90 days of decisions on a public dashboard. Paper only, by design: the point is measuring how well an agent operates a full decision loop unattended, in public, with a paper trail.",
    status: "Runs every weekday at 9:45, dashboard live at trader.ericbackman.com",
    tech: ["Python", "alpaca-py (paper only)", "Anthropic SDK", "TypeScript", "Cloudflare Workers + D1"],
    numbers: ["90-day public decision log"],
    tags: ["agentic-ai", "automated", "live"],
    url: "https://trader.ericbackman.com",
    parts: [
      { name: "trading engine", note: "Python session runner: portfolio review, trade placement, written reasoning" },
      { name: "report worker", note: "TypeScript Worker + D1; token-gated write path, public read path" },
    ],
  },
  {
    slug: "video-essays",
    name: "Claim-locked video essays",
    oneLiner: "Data-driven video essays where a fabricated number is structurally impossible.",
    description:
      "A pipeline that turns a verifiable dataset into a narrated, chart-illustrated video essay where every number on screen traces to a real data row. Research is a query, not a scrape. The script agent may only state numbers present in a verified claim payload, enforced by a deterministic audit plus adversarial multi-agent review. Voice is self-hosted TTS so re-rendering is free. Reference essay: 'The 54-Hole Lead Is a Lie', built on a golf database covering every PGA Tour event 2005-2026 and major history to 1960.",
    status: "Complete, reference essay produced",
    tech: ["Python", "ffmpeg", "Pillow", "Kokoro TTS (self-hosted)", "Claude Opus", "adversarial review agents"],
    numbers: ["every on-screen number traces to a data row", "majors history to 1960"],
    tags: ["agentic-ai", "data"],
    parts: [
      { name: "claim engine", note: "locks the script to a verified data payload; a deterministic audit catches any stray number" },
      { name: "adversarial review", note: "multi-agent pass that tries to refute the script on craft, fact, and engagement" },
      { name: "self-hosted voice", note: "Kokoro TTS on the home server, so re-rendering costs nothing" },
      { name: "chart renderer", note: "Pillow-drawn charts, every figure from the same claim payload" },
    ],
    detail: [
      "Clean engine/adapter split: the engine (script, narration, TTS, render, imagery, compose) is topic-agnostic; a ~2-file adapter maps a new dataset to claims and beats. A second adapter already exists in the tree.",
    ],
  },
  {
    slug: "askviz",
    name: "AskViz",
    oneLiner: "Ask a plain-English question about your data, get a chart on your phone.",
    description:
      "A Cloudflare Worker turns a plain-English question into a Vega-Lite chart over Eric's real (personal) betting history, rendered in a phone PWA. The AI-safety design is the point: Claude never sees a raw record and never does arithmetic. It only chooses a grouping and axis mapping; TypeScript computes every figure, so a fabricated number is structurally impossible. Ships an offline planner that works with no API key at all.",
    status: "v0 deployed",
    tech: ["TypeScript", "Cloudflare Workers", "Claude API", "Vega-Lite", "PWA"],
    numbers: ["19 passing tests", "~20 KB gzipped bundle"],
    tags: ["agentic-ai", "data"],
    detail: [
      "Division of labor is the design: the model chooses grouping and axes, TypeScript computes every figure. Chart wrong at worst, number never wrong.",
      "Ships an offline planner covering common questions, so the app works with no API key at all.",
    ],
  },
  {
    slug: "data-explorer",
    name: "Sports data platform",
    oneLiner: "Local multi-sport SQLite databases built to answer any sports question in plain English.",
    description:
      "Normalized databases for the NBA, NFL, NHL, PGA, and betting markets, with documented schemas and a read-only MCP server so any Claude surface can translate a plain-English question into validated SQL and check the answer against a known fact. Fed by a separate daily ingestion service (the write path) on a home server; this repo is the read path.",
    status: "Complete and in daily use",
    tech: ["Python", "SQLite", "MCP server", "nba_api", "nflverse"],
    numbers: ["7M-row golf holes table", "NBA box scores 1946-present", "NFL 1999-present", "NHL 1997-present"],
    tags: ["data", "agentic-ai"],
    parts: [
      { name: "NBA", note: "box scores 1946-present via nba_api" },
      { name: "NFL", note: "1999-present via nflverse" },
      { name: "NHL", note: "game index 1997-present from the official API" },
      { name: "Golf", note: "every PGA Tour event 2005-2026, majors to 1960, 7M-row holes table" },
      { name: "sports-data MCP server", note: "read-only list_databases / describe_schema / run_sql for any Claude surface" },
      { name: "sports-crons", note: "the write path: daily containerized ingestion on the home server, the only writer to the DBs" },
    ],
    detail: [
      "Read path and write path are separate repos on purpose: the ingestion container is the only writer, everything else queries read-only.",
      "Answers are validated against a known fact before they're trusted; the convention is documented per sport.",
    ],
  },
  {
    slug: "job-hunt",
    name: "Job-hunt operating system",
    oneLiner: "The job search itself, run as an agentic system.",
    description:
      "A daily watcher sweeps 23 company job boards and diffs postings by ATS id, with an independent liveness watchdog alerting if the sweep goes stale. A reconciler agent reads Gmail and keeps the application tracker honest. A fresh-context reviewer agent audits every resume against a checklist distilled from a post-mortem of 4 fast rejections. This MCP server is the newest module.",
    status: "Live, daily scheduled sweep plus watchdog",
    tech: ["Node.js", "Claude subagents", "ATS JSON APIs", "Gmail"],
    numbers: ["23 job boards swept daily", "4 purpose-built subagents"],
    tags: ["agentic-ai", "automated"],
    parts: [
      { name: "role-scout", note: "sources roles and live-verifies each posting against the ATS JSON API" },
      { name: "tracker-reconciler", note: "reads Gmail, classifies confirmations and rejections, keeps the tracker honest" },
      { name: "resume-tailor", note: "re-angles bullets to what a role actually screens for" },
      { name: "voice-ats-reviewer", note: "fresh-context gate: voice + ATS check before any PDF renders" },
      { name: "daily-jobs-watch", note: "9:01 sweep of 23 boards, diffing on stable ATS posting ids" },
      { name: "liveness watchdog", note: "independent daily check that alerts if the sweep itself goes stale" },
    ],
  },
  {
    slug: "newsletter",
    name: "Self-writing engineering newsletter",
    oneLiner: "A weekly newsletter that reads his AI's work logs and writes itself.",
    description:
      "Reads the week's Claude Code session transcripts and git history across the whole workspace, ranks projects by how much Eric personally steered them, generates charts, and publishes a 'here's what I built' issue. Transcript parsing is pure Python in milliseconds; the model only ever sees a ~2 KB digest.",
    status: "Live archive at rickleberry.ericbackman.com (weekly job, currently paused by choice)",
    tech: ["Python", "Anthropic API", "Cloudflare Pages"],
    numbers: ["7 published issues", "~100 MB of transcripts condensed to ~2 KB per issue"],
    tags: ["agentic-ai", "automated", "live"],
    url: "https://rickleberry.ericbackman.com",
    detail: [
      "Ranking is by human steering, not output volume: interventions outweigh commits, commits outweigh ships. The interesting work is where Eric had to step in.",
      "A shared redaction module scrubs secrets and PII at render time before anything publishes.",
    ],
  },
  {
    slug: "frm-study",
    name: "FRM Level 1 study system",
    oneLiner: "A zero-inference personal tutor for the FRM Part I exam.",
    description:
      "Fully static exam-prep platform built on evidence-based learning: retrieval practice, FSRS-4.5 spaced repetition per question, interleaving, adaptive sampling by exam weight and per-book weakness, and blueprint-weighted timed mocks. Content was AI-authored under a validating build script; the served site makes zero API calls.",
    status: "Live at frm.ericbackman.com",
    tech: ["Python build", "static HTML/JS", "vendored KaTeX", "GitHub Pages"],
    numbers: ["501 questions across 12 banks", "60 textbook-chapter note sets"],
    tags: ["web", "live"],
    url: "https://frm.ericbackman.com",
  },
  {
    slug: "dive-map",
    name: "Interactive dive map",
    oneLiner: "A world map of every scuba dive Eric has logged.",
    description:
      "Interactive map with pins, dive metadata (depth, date, type, highlights, rating), trip grouping, and video embeds, all rendered from a structured JSON schema with no build step.",
    status: "Live at dives.ericbackman.com and GitHub Pages",
    tech: ["Leaflet.js", "JavaScript", "JSON", "GitHub Actions"],
    numbers: ["147 dives across 20 trips (counted from the data file)"],
    tags: ["web", "live"],
    url: "https://dives.ericbackman.com",
  },
  {
    slug: "gauntlet",
    name: "The $15 Gauntlet",
    oneLiner: "Build a $15 team, go 16-0. A game family with a tested difficulty contract.",
    description:
      "Browser game: assemble an NBA team from a 5x5 price-tier grid with $15, then survive four boss teams. The win model is shown transparently in-game, and the difficulty contract is enforced by tests over 500 simulated grids. The template spawned MLB and NHL variants with a byte-identical RNG core.",
    status: "Live at 15.ericbackman.com (plus MLB and NHL variants)",
    tech: ["TypeScript", "vitest"],
    numbers: ["500-grid simulated difficulty contract", "3 sport variants from 1 template"],
    tags: ["web", "live"],
    url: "https://15.ericbackman.com",
    parts: [
      { name: "NBA", note: "the original: 4 boss teams, transparent win model shown in-game", url: "https://15.ericbackman.com" },
      { name: "MLB", note: "Perfect October variant", url: "https://october.ericbackman.com" },
      { name: "NHL", note: "Perfect Spring variant", url: "https://cup.ericbackman.com" },
    ],
  },
  {
    slug: "discord-bots",
    name: "Discord bot fleet",
    oneLiner: "A canonical Worker bot template cloned into 5 live prediction and clan bots.",
    description:
      "Serverless Discord bots on Cloudflare Workers: a daily sports picks league (NBA/NHL/MLB/NFL), sumo and F1 variants, and an OSRS clan tracker (public repo). One canonical template; fixes land there first and sweep the clones, each carrying a birthmark comment naming its source. Ed25519-verified interactions, D1 storage, idempotent 15-minute crons.",
    status: "Live bots, scheduled crons",
    tech: ["TypeScript", "Cloudflare Workers + D1", "Discord interactions", "vitest"],
    numbers: ["5 bots from 1 canonical template"],
    tags: ["web", "live", "automated"],
    url: "https://github.com/ericbackman/osrs-clan-bot",
    parts: [
      { name: "picks-worker", note: "the canonical template: daily NBA/NHL/MLB/NFL picks league with tap-to-pick buttons" },
      { name: "sumo-picks", note: "honbasho league; picks lock at 15:45 JST, upsets score extra" },
      { name: "f1-picks", note: "Grand Prix weekend markets: pole, Q1 casualty, ordered podium with partial credit" },
      { name: "osrs-clan-bot", note: "clan XP/boss/drop race tracker, public repo", url: "https://github.com/ericbackman/osrs-clan-bot" },
      { name: "wow-clan-bot", note: "WoW clan variant" },
    ],
    detail: [
      "The reuse discipline is the point: a fix to the shared REST layer landed at the canonical home and was swept to every clone in one audited pass, catching two bots whose error handling had silently drifted.",
    ],
  },
  {
    slug: "life-tracker",
    name: "Life Tracker, MCP server + personal data platform",
    oneLiner: "Personal data platform with an MCP server exposing read-only query tools to Claude.",
    description:
      "Journal, tasks, health, and reading data behind a FastAPI backend with SQLite persistence and encryption at rest. A FastMCP server exposes 5 read-only query tools, with a server-side gate excluding sensitive entries by default. Now pivoting to a native iOS app: SwiftUI, CloudKit private database, no backend, Anthropic API called from the device.",
    status: "Complete, in personal use",
    tech: ["Python", "FastAPI", "FastMCP", "SQLite", "SwiftUI", "CloudKit"],
    numbers: ["5 read-only MCP tools"],
    tags: ["agentic-ai", "data"],
  },
  {
    slug: "side-bet",
    name: "Side Bet",
    oneLiner: "A multiplayer party game, built two-person with a protected-main PR workflow.",
    description:
      "Friends bet sportsbook-style on mini-games they play against each other. Unity with host-authoritative netcode over Unity Relay. Built with a friend partly to run a real team git workflow: main is protected, every change needs a PR, an approval, and a green test check.",
    status: "In development, public repo, CI green",
    tech: ["Unity", "C#", "Netcode for GameObjects", "GitHub Actions CI"],
    numbers: ["28 unit tests on the core betting logic"],
    tags: ["web"],
    url: "https://github.com/ericbackman/side-bet",
  },
];

export const WORKSPACE = {
  headline:
    "A 72-repository agentic workspace where Claude Code operates with real responsibility behind engineered guardrails.",
  stats: [
    "72 git repositories, 753 commits in the first 7 months of 2026",
    "26 live subdomains under ericbackman.com (this server is the newest)",
    "289 logged agent sessions across 39 projects: 25,610 tool calls, 5,427 files changed, every session trust-scored",
    "13 custom subagents with narrow jobs and scoped tools",
    "197 memory files across 16 projects, carrying corrections between sessions",
    "17 operational playbooks, one per live system",
    "12 scheduled jobs routed through one retry/log/alert wrapper",
    "4 MCP servers built: YouTube operations, sports databases, personal data platform, and this resume",
  ],
  principles: [
    "Silent wrong behavior is the enemy: secrets fail loudly, every external call gets a timeout and retry, no bare exception handlers, no fallback defaults that hide the real error.",
    "Model tiering as org design: Sonnet executes playbooks, Opus changes playbooks, Eric approves what the public sees.",
    "Fresh-context review before anything ships, because an author is blind to its own tells.",
    "Rule of two: the second time a pattern is built in a different repo, it is promoted to one canonical home with a tracked consumer list. Clones carry a birthmark comment naming their source.",
    "Auto-commit hooks stage tracked files only, so a stray secret can never land in git. A leak scanner runs before every commit.",
    "Trust is measured, not assumed: a dashboard scores each session 0-100 on how far it ran unattended, and a needed human correction caps it at 60.",
    "Numbers come from data files, not READMEs: READMEs drift, data doesn't.",
  ],
};

export const BMO_WORK = {
  role: "Data Scientist, Market Risk (Capital), Aug 2025 to present",
  headline:
    "Builds the data platform and multi-agent LLM pipelines behind FRTB (Fundamental Review of the Trading Book) regulatory capital investigations. Risk analysts now get answers in under 15 minutes that used to take 2 days.",
  detail: [
    "Designed an AI platform automating the extraction, comparison, and analysis of risk-weighted assets across FRTB SA asset classes for capital investigations.",
    "Integrated multiple LLM agents and specialized models into orchestrated pipelines that help analysts identify capital movements quickly.",
    "Built secure ML pipelines ingesting sensitive risk data inside BMO's governance framework, with logging, monitoring, and anomaly detection watching for drift.",
    "Developed evaluation protocols for every AI module used in capital investigations, with human auditor loops, bias documentation, and approval checklists.",
    "Worked with risk SMEs, IT, and compliance to keep the platform inside OSFI and Basel III frameworks.",
  ],
  context:
    "This is agentic AI deployed inside a regulated bank: human-review loops, model governance, and explainability are not add-ons, they are the operating conditions.",
};

export const EXPERIENCE = [
  {
    org: "BMO (Bank of Montreal)",
    role: "Data Scientist",
    period: "Aug 2025 to present",
    where: "Toronto",
    note: "Data platform and multi-agent LLM pipelines for FRTB SA regulatory capital investigations. Cut analyst investigation time from 2 days to under 15 minutes. Ask the get_bmo_work tool for detail.",
  },
  {
    org: "Independent agentic AI lab and math tutoring",
    period: "Aug 2022 to Aug 2025",
    role: "Independent",
    where: "Toronto",
    note: "Tutored math for grades 1-12 while building the agentic workspace this server describes. Ask the get_workspace tool for what that became.",
  },
  {
    org: "Ecobee",
    role: "Data Scientist",
    period: "May 2021 to Jul 2022",
    where: "Toronto",
    note: "Validated the air-quality sensor for the next-generation smart thermostat, ran field trials of a Model Predictive Control thermal controller, and retrained the smart security model for a ~6% accuracy gain.",
  },
  {
    org: "Smile CDR",
    role: "Junior Backend Developer",
    period: "Nov 2020 to May 2021",
    where: "Toronto",
    note: "Built FHIR-compliant healthcare data mapping APIs in Java and Spring Boot.",
  },
  {
    org: "Ecobee",
    role: "Data Science and Embedded QA internships",
    period: "2018 to 2019",
    where: "Toronto",
    note: "16-month professional internship. Helped build an experimentation platform deploying C++ A/B tests to thermostats in the field, cutting the firmware release cycle to every 2 weeks.",
  },
];

export const EDUCATION = {
  school: "Queen's University",
  degree: "B.A.Sc. in Applied Mathematics and Computer Engineering",
  period: "2015 to 2020",
  notes: ["Graduated with Honours, 3.77 GPA", "Bilingual: English and French"],
};

export const SKILLS = {
  languages: ["Python (primary)", "SQL", "TypeScript/JavaScript", "Java", "Bash", "PowerShell"],
  ai: [
    "Claude Code: custom skills, hooks, subagents, worktree workflows",
    "Claude API and SDK: LLM pipelines, prompt design, evaluation",
    "MCP: server design and tool interfaces (FastMCP, and this hand-rolled server)",
    "Multi-agent orchestration with human-review gates",
  ],
  data: ["BigQuery", "Apache Beam / Dataflow", "Airflow", "PostgreSQL", "SQLite", "DuckDB", "Docker", "pandas"],
  cloud: ["GCP (Cloud Functions, Pub/Sub, Cloud Storage)", "Cloudflare (Workers, Pages, Access, D1, Durable Objects)"],
  domain: ["FRTB SA, VaR, CCR, Basel III / OSFI CAR", "FHIR healthcare interoperability", "IoT sensor validation"],
};

export const GAPS = [
  "His cloud is GCP and Cloudflare, not AWS or Azure.",
  "His agent stack is Claude Code and MCP, not LangGraph or LangChain.",
  "He hasn't run Spark.",
  "He hasn't fine-tuned models; his work is orchestration, evaluation, and productionizing, not training.",
  "Formal data-science job tenure is about 2 years (Ecobee + BMO), alongside the 3-year independent lab.",
];

// Featured on the landing page. All shot by Eric, all cut/uploaded/scheduled
// by the studio pipeline. Thumbnails come from i.ytimg.com; tiles link out
// (embedding is currently disabled channel-wide on upload).
export const FEATURED_VIDEOS: Array<{ id: string; title: string; kind: "short" | "video" }> = [
  { id: "H4rfOjeriYw", title: "A reef shark on patrol", kind: "short" },
  { id: "rQEQ_G0qAZs", title: "The pod just kept coming", kind: "short" },
  { id: "TeZknVfAYkw", title: "Gliding with a manta ray", kind: "short" },
  { id: "Y-ruH0Ox7-k", title: "A wall of barracuda", kind: "short" },
  { id: "6OzOIoT4ewA", title: "Swimming with dolphins in 4K", kind: "video" },
];

export const META = {
  what: "This server is Eric's resume, published as a Model Context Protocol server so AI assistants can query it directly.",
  why: "A resume can claim anything. This one is built as evidence: it is served by an MCP server Eric built, its narrative was written by the AI he works with every day, and every number in it was pulled from the workspace it describes.",
  how: "Hand-rolled JSON-RPC over Streamable HTTP on a Cloudflare Worker. No runtime dependencies. Stateless. The content lives in one typed data module.",
  written: "2026-07-28",
};
