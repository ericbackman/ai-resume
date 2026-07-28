# ai-resume — AI-native resume MCP server

Live at **ai.ericbackman.com** (Cloudflare Worker, custom domain). Release-grade,
public, portfolio-facing: full STANDARDS.md bar applies. Read PLAYBOOK.md before
operating or debugging the live worker.

## What lives where

- `src/mcp.ts` — stateless MCP/JSON-RPC core (pure, unit-tested, no I/O). Don't add an SDK; being dependency-free is part of the pitch.
- `src/resume-data.ts` — ALL structured content (profile, projects, BMO, skills, gaps). One typed module; landing page and tools both render from it, so they can't drift.
- `src/narrative.ts` — the Claude-written narrative resume. Canonical draft: job-hunt repo `resumes/written-by-claude/resume.md`. Edit there first, then sync here.
- `src/tools.ts` / `src/landing.ts` / `src/index.ts` — tool defs, HTML+llms.txt, router.

## Rules

- **Truth bar:** every number served here must be verifiable in the workspace on the stated date. Update `META.written` whenever stats are refreshed. Never pad counts.
- **Eric approves what the public sees.** Content changes (data/narrative) get his OK before deploy; pure infra fixes don't need it.
- **Honest gaps stay.** `get_skills_and_gaps` listing what Eric has NOT done is deliberate strategy (see job-hunt `research/rejection-red-flags-2026-06-27.md`). Don't "improve" it away.
- Before deploy: `npm run typecheck && npm test`. Both must pass.

## Ship

```bash
npm run deploy   # wrangler deploy → ai.ericbackman.com
```
