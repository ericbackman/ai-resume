# PLAYBOOK: ericbackman.com (AI-native resume)

**System:** Cloudflare Worker `ai-resume`, custom domains **ericbackman.com**
(the apex, this IS Eric's homepage since 2026-07-28), www.ericbackman.com
(301 → apex, handled in the worker), and ai.ericbackman.com (the advertised
MCP connector URL). Stateless, read-only, no bindings, no secrets, no
scheduled jobs. The previous portfolio (Pages project `portfolio-94i`, repo
ericbackman.github.io) was detached from the apex but still exists at
portfolio-94i.pages.dev; its GitHub Actions deploy still runs harmlessly.
**Stakes:** public portfolio surface for Eric's job search. Wrong facts or
downtime in front of a recruiter is the failure mode; nothing here can lose data.

## Health check

```bash
curl -s https://ai.ericbackman.com/llms.txt | head -3
curl -s -X POST https://ai.ericbackman.com/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Healthy = 200 with a `tools` array of 11 entries. Any 5xx: check
Cloudflare dashboard → Workers → ai-resume → Logs (observability is enabled,
head_sampling_rate 1).

## Update content

1. Edit `src/resume-data.ts` (facts) or sync `src/narrative.ts` from the
   canonical draft in job-hunt `resumes/written-by-claude/resume.md`.
2. Refresh `META.written` if stats were re-verified.
3. `npm run typecheck && npm test`: must pass.
4. Content changes need Eric's OK (public-facing rule). Then `npm run deploy`.

## Styling — house tokens, no hex

The landing page is a backman-design consumer and ships **all five cottage themes**
with a visitor-facing picker. `src/tokens.ts` is a **copy** of
`backman-design/dist/tokens.ts` (birthmark comment intact) — regenerate at the
source and re-copy, never hand-edit.

- **The site follows the time of day.** `DARK_THEME` (`greatroom`) shows from
  `DAY_END_HOUR` to `DAY_START_HOUR`; `LIGHT_THEME` shows through the day. The
  boundaries are 19:00 and 07:00, read from the **visitor's** local clock, so
  someone opening this from another timezone gets their own evening.
- **`LIGHT_THEME` is not hardcoded** — it is read from `greatroom`'s declared
  `lightTwin` in backman-design and asserted to be `windowwall`, so if that pairing
  ever changes upstream the build fails instead of silently drifting.
- **Theme selection precedence**: `?theme=<name>` → `localStorage["bd-theme"]` →
  time of day. A pre-paint inline script applies the result, so neither a stored
  choice nor the day/night default ever flashes the wrong theme first. Unknown
  names are ignored, not applied.
- **The picker's "Auto" button clears the stored choice** and returns the visitor
  to the time-of-day default; the label then reads `Auto · <theme>`. Time is
  evaluated on load only — an open tab does not flip underneath the reader.
- **`themeVars()` emits every value as a LITERAL, computed at build time** — the 12
  tokens, the card surfaces, the translucent derivatives (`--scrim`, `--wash-a`,
  `--card-shadow`, …) and the timeline ramp. Do not reintroduce
  `color-mix(..., transparent)` in the stylesheet: the emitted-literal approach is
  what makes a live theme switch deterministic, and it is also where the contrast
  work happens.
- **`liftForContrast()` walks a hue toward the ink until it clears 4.5:1 against
  every surface it can land on** (`--bd-ground`, `--surface`, `--raised-surface`).
  This is measured per theme, not a fixed percentage: a flat 45% lift left
  greatroom's and windowwall's fifth timeline track at ~4.2:1, and lifting against
  the ground alone still failed the status badges, which sit on cards.
- **No hex in the stylesheet.** The timeline's seven track colours come from
  `categorical()`, which dedupes before extending — ledgestone gives `accent`,
  `ink-2` and `line-2` all as `#ADB1B6`, and without the dedupe two tracks would
  silently share a colour.

**Re-verify after any theme or palette change** — load `/?theme=<name>` for each of
the five and audit contrast. Last run: **0 text failures and 0 SVG-text failures in
all five themes, 7 distinct track hues each**, `tsc --noEmit` clean, 16/16 tests.
Note that auditing by flipping `data-theme` in a *hidden* browser tab gives false
readings: style recalc is deferred there, so used values go stale. Load the page
fresh per theme instead.

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
