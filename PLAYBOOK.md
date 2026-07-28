# PLAYBOOK — ai.ericbackman.com (AI-native resume)

**System:** Cloudflare Worker `ai-resume`, custom domain ai.ericbackman.com.
Stateless, read-only, no bindings, no secrets, no scheduled jobs.
**Stakes:** public portfolio surface for Eric's job search. Wrong facts or
downtime in front of a recruiter is the failure mode; nothing here can lose data.

## Health check

```bash
curl -s https://ai.ericbackman.com/llms.txt | head -3
curl -s -X POST https://ai.ericbackman.com/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Healthy = 200 with a `tools` array of 9 entries. Any 5xx: check
Cloudflare dashboard → Workers → ai-resume → Logs (observability is enabled,
head_sampling_rate 1).

## Update content

1. Edit `src/resume-data.ts` (facts) or sync `src/narrative.ts` from the
   canonical draft in job-hunt `resumes/written-by-claude/resume.md`.
2. Refresh `META.written` if stats were re-verified.
3. `npm run typecheck && npm test` — must pass.
4. Content changes need Eric's OK (public-facing rule). Then `npm run deploy`.

## Roll back

```bash
npx wrangler rollback        # interactive: pick the previous deployment
# or: git checkout <good-sha> && npm run deploy
```

## Known operating notes

- The worker is stateless: no sessions, no SSE. MCP clients that demand a GET
  SSE stream get a 405; every mainstream client (Claude.ai, Claude Code,
  Inspector) falls back to plain Streamable HTTP correctly.
- `worker-configuration.d.ts` is generated (`npm run types`), gitignored, and
  required by `typecheck`. If tsc complains about missing Env types, run it.
- Custom-domain DNS is managed by the `custom_domain: true` route in
  wrangler.jsonc. Do not hand-create DNS records for `ai` in the zone.
- Cloudflare Bot Fight Mode on the zone 403s Python clients that send the
  stock `Python-urllib/x.y` user-agent (verified 2026-07-28). curl, Node
  (undici — Claude Code's MCP client), and any client with a custom UA pass.
  If a recruiter reports their AI can't connect, this is the first suspect.
  Turning BFM off is a zone-level security decision — Eric's call, and it
  affects every other subdomain on the zone.

## Escalation

Model tiering: any tier may run the health check and rollback; content edits and
this playbook are Opus-level changes; Eric approves anything the public sees.
