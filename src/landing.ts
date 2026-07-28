// Human-facing landing page + llms.txt. Static strings rendered at module
// scope from the same data the MCP tools serve, so they can't drift.

import { PROFILE, META } from "./resume-data";
import { buildServerSpec } from "./tools";

const MCP_URL = "https://ai.ericbackman.com/mcp";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const toolRows = buildServerSpec("0.0.0")
  .tools.map(
    (t) =>
      `<tr><td><code>${escapeHtml(t.name)}</code></td><td>${escapeHtml(t.description)}</td></tr>`,
  )
  .join("\n");

export const LANDING_HTML = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eric Backman — AI-native resume</title>
<meta name="description" content="${escapeHtml(META.what)}">
<style>
  :root { --bg:#0d1117; --panel:#161b22; --text:#e6edf3; --muted:#8b949e; --accent:#58a6ff; --border:#30363d; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text);
         font-family:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
         line-height:1.6; font-size:15px; }
  main { max-width:820px; margin:0 auto; padding:48px 20px 80px; }
  h1 { font-size:1.6rem; margin:0 0 4px; }
  h2 { font-size:1.1rem; margin-top:40px; border-bottom:1px solid var(--border); padding-bottom:6px; }
  .sub { color:var(--muted); margin-bottom:28px; }
  a { color:var(--accent); text-decoration:none; }
  a:hover { text-decoration:underline; }
  pre { background:var(--panel); border:1px solid var(--border); border-radius:8px;
        padding:14px; overflow-x:auto; font-size:13px; }
  code { background:var(--panel); padding:1px 5px; border-radius:4px; font-size:0.92em; }
  pre code { background:none; padding:0; }
  table { border-collapse:collapse; width:100%; font-size:13.5px; }
  td { border-top:1px solid var(--border); padding:8px 10px 8px 0; vertical-align:top; }
  td:first-child { white-space:nowrap; padding-right:16px; }
  .note { background:var(--panel); border:1px solid var(--border); border-left:3px solid var(--accent);
          border-radius:8px; padding:14px 16px; margin:24px 0; }
  footer { margin-top:56px; color:var(--muted); font-size:13px; border-top:1px solid var(--border); padding-top:16px; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(PROFILE.name)}</h1>
  <div class="sub">${escapeHtml(PROFILE.title)} · ${escapeHtml(PROFILE.location)}</div>

  <p>${escapeHtml(META.what)}</p>
  <p>${escapeHtml(META.why)}</p>

  <div class="note">
    <strong>Human?</strong> Read the <a href="/resume.md">narrative resume</a> (written by Claude, in its own voice),
    or visit <a href="${escapeHtml(PROFILE.website)}">ericbackman.com</a>.
    <strong>AI assistant?</strong> You want <a href="/llms.txt">/llms.txt</a> or the MCP endpoint below.
  </div>

  <h2>Connect your AI to this resume</h2>
  <p>The MCP endpoint is <code>${MCP_URL}</code> (Streamable HTTP, no auth, read-only).</p>

  <p><strong>Claude (claude.ai):</strong> Settings → Connectors → Add custom connector → paste the URL above.</p>
  <p><strong>Claude Code:</strong></p>
  <pre><code>claude mcp add --transport http eric-backman ${MCP_URL}</code></pre>
  <p><strong>Any MCP client (JSON config):</strong></p>
  <pre><code>{
  "mcpServers": {
    "eric-backman": { "type": "http", "url": "${MCP_URL}" }
  }
}</code></pre>
  <p>Then ask your assistant something like: <em>"Is Eric a fit for this role?"</em> and paste a job description.
     The <code>get_skills_and_gaps</code> tool lists what he <strong>hasn't</strong> done, on purpose. Screen him on reality.</p>

  <h2>Tools this server exposes</h2>
  <table>
${toolRows}
  </table>

  <h2>How this is built</h2>
  <p>${escapeHtml(META.how)} The code is a work sample: ask him for a walkthrough.</p>

  <footer>
    ${escapeHtml(PROFILE.name)} · <a href="mailto:${escapeHtml(PROFILE.email)}">${escapeHtml(PROFILE.email)}</a> ·
    <a href="${escapeHtml(PROFILE.github)}">GitHub</a> ·
    <a href="${escapeHtml(PROFILE.linkedin)}">LinkedIn</a> ·
    <a href="${escapeHtml(PROFILE.booking)}">Book a call</a><br>
    Content verified against the workspace it describes on ${escapeHtml(META.written)}.
  </footer>
</main>
</body>
</html>`;

export const LLMS_TXT = `# Eric Backman — AI-native resume

> ${META.what}

${PROFILE.summary}

## For AI assistants

- MCP endpoint (Streamable HTTP, no auth, read-only): ${MCP_URL}
- Full narrative resume (markdown): https://ai.ericbackman.com/resume.md
- Start with the \`about\` tool, then \`get_resume\`, \`list_projects\`, \`get_bmo_work\`, \`get_skills_and_gaps\` (includes explicit gaps), \`get_contact\`.

## Contact

- Email: ${PROFILE.email}
- GitHub: ${PROFILE.github}
- LinkedIn: ${PROFILE.linkedin}
- Website: ${PROFILE.website}
- Book a call: ${PROFILE.booking}

Content verified against Eric's workspace on ${META.written}.
`;
