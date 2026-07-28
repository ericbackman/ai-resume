// All resume content, in one place. Every number here was pulled from the
// workspace it describes (commit logs, config files, operations registries)
// on 2026-07-28. Update this file, redeploy, done.

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
}

// Curated to the most complete systems. Tag "agentic-ai" marks projects where
// AI agents do the operating, not just the authoring.
export const PROJECTS: Project[] = [
  {
    slug: "ai-resume",
    name: "This server (AI-native resume)",
    oneLiner: "The MCP server you are querying right now.",
    description:
      "A dependency-free Model Context Protocol server on a Cloudflare Worker. Serves Eric's resume as structured tools any AI assistant can call, plus a human landing page and llms.txt. The narrative resume it serves was written by Claude from inside Eric's workspace.",
    status: "Live at ai.ericbackman.com",
    tech: ["TypeScript", "Cloudflare Workers", "MCP (Streamable HTTP)"],
    numbers: ["0 runtime dependencies", "9 tools"],
    tags: ["agentic-ai", "live"],
    url: "https://ai.ericbackman.com",
  },
  {
    slug: "content-studio",
    name: "YouTube content studio",
    oneLiner: "A 6-agent studio that produces and schedules a real YouTube channel.",
    description:
      "Agents research (query real datasets, never scrape claims), storyboard, source license-cleared imagery, and render scuba-diving videos. An adversarial reviewer agent tries to refute every script before render. Daily scheduled jobs pre-render, upload as private, and monitor analytics. Nothing publishes without Eric's review: the human gate is enforced by design, not by discipline.",
    status: "Live channel, daily automated render/upload/monitor jobs",
    tech: ["Python", "ffmpeg", "YouTube Data API", "Claude subagents", "PowerShell scheduling"],
    numbers: ["6 specialized agents", "3 daily scheduled jobs plus a weekly channel-manager loop"],
    tags: ["agentic-ai", "automated", "live"],
  },
  {
    slug: "agent-audit",
    name: "Agent reliability dashboard",
    oneLiner: "Scores every logged Claude Code session on how far it ran unattended.",
    description:
      "Turns the generation-to-verification loop into a 0-to-100 trust score per session. A needed human correction hard-caps a session at 60, because stepping in at all proves it wasn't safe to run alone. After a silent 8-day deploy freeze, the page gained a client-side staleness guard so a frozen dashboard flags its own age instead of failing quietly.",
    status: "Live at loop.ericbackman.com (Access-gated), refreshed weekly by a scheduled job",
    tech: ["Python (stdlib)", "Cloudflare Workers", "Cloudflare Access", "hand-rolled SVG charts"],
    numbers: ["213+ scored sessions", "correction hard-cap at 60/100"],
    tags: ["agentic-ai", "live", "automated"],
    url: "https://loop.ericbackman.com",
  },
  {
    slug: "data-explorer",
    name: "Sports data platform",
    oneLiner: "Local SQLite databases built to answer any sports question in plain English.",
    description:
      "Multi-sport databases (NBA, NFL, MLB, PGA, betting markets) with documented schemas, so an AI agent can translate a plain-English question into validated SQL and check the answer against a known fact before trusting it. Fed by a separate daily ingestion service (sports-crons) running on a home server.",
    status: "Complete and in daily use, ingestion scheduled daily",
    tech: ["Python", "SQLite", "Claude Code"],
    numbers: [],
    tags: ["data", "agentic-ai", "automated"],
  },
  {
    slug: "paper-trader",
    name: "Agentic paper trader",
    oneLiner: "An AI trading desk that runs its own session every weekday morning.",
    description:
      "Scheduled agentic system that reviews positions and executes paper trades each weekday at 9:45, with reports served from a Cloudflare Worker. Paper only, by design: the point is measuring how well an agent operates a full decision loop unattended, not the returns.",
    status: "Runs every weekday at 9:45 via scheduled job",
    tech: ["Python", "Claude Code", "Cloudflare Workers"],
    numbers: [],
    tags: ["agentic-ai", "automated"],
  },
  {
    slug: "dive-map",
    name: "Interactive dive map",
    oneLiner: "Geospatial catalogue of all 156 dive sites Eric has visited.",
    description:
      "Full-stack geospatial web app: site details, depth profiles, dive types, ratings, and YouTube embeds render dynamically from a structured JSON schema, no hardcoded HTML per site.",
    status: "Live on GitHub Pages",
    tech: ["Leaflet.js", "JavaScript", "JSON", "GitHub Pages"],
    numbers: ["156 dive sites", "8+ countries"],
    tags: ["web", "live"],
    url: "https://ericbackman.github.io/dive-map",
  },
  {
    slug: "job-hunt",
    name: "Job-hunt operating system",
    oneLiner: "The job search itself, run as an agentic system.",
    description:
      "A daily watcher sweeps 23 company job boards and diffs postings by ATS id. A reconciler agent reads Gmail and keeps the application tracker honest. A fresh-context reviewer agent audits every resume against a checklist distilled from a post-mortem of 4 fast rejections. This MCP server is the newest module.",
    status: "Live, daily scheduled sweep with a liveness watchdog",
    tech: ["Node.js", "Claude subagents", "ATS JSON APIs", "Gmail"],
    numbers: ["23 job boards swept daily", "4-rejection audit turned into a pre-render gate"],
    tags: ["agentic-ai", "automated"],
  },
  {
    slug: "life-tracker",
    name: "Life Tracker, MCP server + personal data platform",
    oneLiner: "Personal data platform with an MCP server exposing read-only query tools to Claude.",
    description:
      "Journal, tasks, health, and reading data behind a FastAPI backend with SQLite persistence and encryption at rest. A FastMCP server exposes 5 read-only query tools, with user-controlled gates excluding sensitive entries by default.",
    status: "Complete, in personal use",
    tech: ["Python", "FastAPI", "FastMCP", "SQLAlchemy", "SQLite", "Fernet"],
    numbers: ["5 read-only MCP tools"],
    tags: ["agentic-ai", "data"],
  },
  {
    slug: "newsletter",
    name: "LLM newsletter pipeline",
    oneLiner: "Weekly engineering digest generated from his own session transcripts and git history.",
    description:
      "Parses Claude Code transcripts and git history across every project, ranks the week's work by how much human steering it needed, condenses ~100 MB of raw transcripts into a ~2 KB digest, then generates a publication-ready article via the Anthropic API. Unattended weekly build and deploy, with secret and PII redaction at render time.",
    status: "Automated weekly build via scheduled job",
    tech: ["Python", "Anthropic SDK", "matplotlib"],
    numbers: ["~100 MB transcripts to ~2 KB digest per issue"],
    tags: ["agentic-ai", "automated"],
  },
  {
    slug: "frm-study",
    name: "FRM Level 1 study system",
    oneLiner: "AI-assisted exam-prep platform with spaced repetition.",
    description:
      "Question bank with exam-weighted sampling, FSRS-4.5 spaced repetition, interleaved sessions, and timed mocks. Built and maintained with Claude Code across parallel git worktrees.",
    status: "Live on GitHub Pages",
    tech: ["Python", "Jinja2", "JavaScript", "GitHub Pages"],
    numbers: ["228 questions"],
    tags: ["web", "live"],
    url: "https://ericbackman.github.io/frm_level1",
  },
  {
    slug: "discord-bots",
    name: "Discord bot fleet",
    oneLiner: "A template Worker bot cloned into 5 live prediction and clan bots.",
    description:
      "A canonical Discord bot on Cloudflare Workers (picks-worker) serves as the template brick for sumo, F1, and game-clan bots. Fixes land at the canonical home first, then sweep the clones, each of which carries a birthmark comment naming its source.",
    status: "Live bots on Cloudflare Workers",
    tech: ["TypeScript", "Cloudflare Workers", "Discord API"],
    numbers: ["5 bots from 1 canonical template"],
    tags: ["web", "live", "automated"],
  },
  {
    slug: "upload-calendar",
    name: "Upload calendar",
    oneLiner: "Live dashboard of both YouTube channels' upcoming publish schedule.",
    description:
      "A daily job rebuilds the schedule from the live YouTube API for two channels and redeploys a static schedule page.",
    status: "Live at schedule.ericbackman.com, refreshed daily",
    tech: ["Python", "YouTube Data API", "Cloudflare"],
    numbers: ["2 channels"],
    tags: ["automated", "live"],
    url: "https://schedule.ericbackman.com",
  },
];

export const WORKSPACE = {
  headline: "A 72-repository agentic workspace where Claude Code operates with real responsibility behind engineered guardrails.",
  stats: [
    "72 git repositories, 753 commits in the first 7 months of 2026",
    "13 custom subagents with narrow jobs and scoped tools",
    "197 memory files across 16 projects, carrying corrections between sessions",
    "17 operational playbooks, one per live system",
    "12 scheduled jobs routed through one retry/log/alert wrapper",
  ],
  principles: [
    "Silent wrong behavior is the enemy: secrets fail loudly, every external call gets a timeout and retry, no bare exception handlers, no fallback defaults that hide the real error.",
    "Model tiering as org design: Sonnet executes playbooks, Opus changes playbooks, Eric approves what the public sees.",
    "Fresh-context review before anything ships, because an author is blind to its own tells.",
    "Rule of two: the second time a pattern is built in a different repo, it is promoted to one canonical home with a tracked consumer list. Clones carry a birthmark comment naming their source.",
    "Auto-commit hooks stage tracked files only, so a stray secret can never land in git. A leak scanner runs before every commit.",
    "Trust is measured, not assumed: a dashboard scores each session 0-100 on how far it ran unattended, and a needed human correction caps it at 60.",
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
  data: ["BigQuery", "Apache Beam / Dataflow", "Airflow", "PostgreSQL", "SQLite", "Docker", "pandas"],
  cloud: ["GCP (Cloud Functions, Pub/Sub, Cloud Storage)", "Cloudflare (Workers, Pages, Access, D1)"],
  domain: ["FRTB SA, VaR, CCR, Basel III / OSFI CAR", "FHIR healthcare interoperability", "IoT sensor validation"],
};

export const GAPS = [
  "His cloud is GCP and Cloudflare, not AWS or Azure.",
  "His agent stack is Claude Code and MCP, not LangGraph or LangChain.",
  "He hasn't run Spark.",
  "He hasn't fine-tuned models; his work is orchestration, evaluation, and productionizing, not training.",
  "Formal data-science job tenure is about 2 years (Ecobee + BMO), alongside the 3-year independent lab.",
];

export const META = {
  what: "This server is Eric's resume, published as a Model Context Protocol server so AI assistants can query it directly.",
  why: "Every resume now says 'experienced with AI agents.' Eric's evidence is structural: the resume itself is served by an MCP server he built, its narrative was written by the AI he works with daily, and every number in it was pulled from the workspace it describes.",
  how: "Hand-rolled JSON-RPC over Streamable HTTP on a Cloudflare Worker. No runtime dependencies. Stateless. The content lives in one typed data module.",
  written: "2026-07-28",
};
