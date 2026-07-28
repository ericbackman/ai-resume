# ai-resume

Eric Backman's AI-native resume: a Model Context Protocol (MCP) server at
[ai.ericbackman.com](https://ai.ericbackman.com) that AI assistants can query
directly, plus a human landing page.

The narrative resume it serves was written by Claude, in its own voice, from
inside the agentic workspace it describes. The server is part of the evidence:
hand-rolled JSON-RPC over Streamable HTTP on a Cloudflare Worker, zero runtime
dependencies, stateless.

## Endpoints

| Path | What |
|---|---|
| `/` | Human landing page: what this is, how to connect an AI |
| `/mcp` | MCP endpoint (Streamable HTTP, POST, no auth, read-only) |
| `/resume.md` | The narrative resume, markdown |
| `/llms.txt` | Summary for AI crawlers/assistants |

## Connect

```bash
claude mcp add --transport http eric-backman https://ai.ericbackman.com/mcp
```

Or in claude.ai: Settings → Connectors → Add custom connector → `https://ai.ericbackman.com/mcp`.

## Develop

```bash
npm install
npm run typecheck   # wrangler types + tsc
npm test            # vitest, protocol + tool tests
npm run dev         # local server on :8787
npm run deploy      # deploy to ai.ericbackman.com
```

Content lives in `src/resume-data.ts` (structured facts) and `src/narrative.ts`
(the Claude-written resume). Change, test, deploy.
