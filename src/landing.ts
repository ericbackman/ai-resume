// Human-facing landing page + llms.txt. All page HTML is generated at module
// scope from the same typed data the MCP tools serve, so page and tools can't
// drift. Client JS builds DOM via createElement/textContent only — no
// innerHTML with dynamic content, matching the workspace house rule.

import { PROFILE, META, PROJECTS, WORKSPACE, FEATURED_VIDEOS, type Project } from "./resume-data";
import { buildServerSpec } from "./tools";

const MCP_URL = "https://ai.ericbackman.com/mcp";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SPEC = buildServerSpec("0.0.0");

// ---- server-rendered fragments -------------------------------------------

const STAT_TILES: Array<{ value: string; label: string }> = [
  { value: "72", label: "git repositories" },
  { value: "753", label: "commits in 2026" },
  { value: "289", label: "trust-scored agent sessions" },
  { value: "26", label: "live subdomains" },
  { value: "4", label: "MCP servers built" },
  { value: "17", label: "operational playbooks" },
];

const statTilesHtml = STAT_TILES.map(
  (s) => `<div class="tile"><div class="tile-v">${escapeHtml(s.value)}</div><div class="tile-l">${escapeHtml(s.label)}</div></div>`,
).join("\n");

const toolChipsHtml = SPEC.tools
  .map(
    (t) =>
      `<button class="chip tool-chip" data-tool="${escapeHtml(t.name)}" title="${escapeHtml(t.description)}">${escapeHtml(t.name)}</button>`,
  )
  .join("\n");

type StatusKind = "live" | "scheduled" | "complete";

function statusKind(p: Project): StatusKind {
  if (p.tags.includes("live")) return "live";
  if (p.tags.includes("automated")) return "scheduled";
  return "complete";
}

const STATUS_LABEL: Record<StatusKind, string> = {
  live: "live",
  scheduled: "scheduled",
  complete: "complete",
};

function projectCardHtml(p: Project): string {
  const kind = statusKind(p);
  const partsChips = (p.parts ?? [])
    .map((part) => `<span class="part" title="${escapeHtml(part.note)}">${escapeHtml(part.name)}</span>`)
    .join("");
  const numbers = p.numbers.length > 0 ? `<div class="card-numbers">${escapeHtml(p.numbers.join(" · "))}</div>` : "";
  const link =
    p.url !== undefined
      ? `<a class="card-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(p.name)}" onclick="event.stopPropagation()">↗</a>`
      : "";
  return `<article class="card" data-slug="${escapeHtml(p.slug)}" data-tags="${escapeHtml(p.tags.join(" "))}" tabindex="0" role="button" aria-label="Ask the server about ${escapeHtml(p.name)}">
  <div class="card-top">
    <span class="status status-${kind}"><span class="dot"></span>${STATUS_LABEL[kind]}</span>
    ${link}
  </div>
  <h3>${escapeHtml(p.name)}</h3>
  <p>${escapeHtml(p.oneLiner)}</p>
  ${numbers}
  ${partsChips === "" ? "" : `<div class="card-parts">${partsChips}</div>`}
</article>`;
}

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "everything" },
  { key: "agentic-ai", label: "agentic AI" },
  { key: "live", label: "live" },
  { key: "automated", label: "runs unattended" },
  { key: "data", label: "data" },
  { key: "web", label: "web & games" },
];

const filterChipsHtml = FILTERS.map(
  (f, i) =>
    `<button class="chip filter-chip${i === 0 ? " active" : ""}" data-filter="${escapeHtml(f.key)}" aria-pressed="${i === 0 ? "true" : "false"}">${escapeHtml(f.label)}</button>`,
).join("\n");

const cardsHtml = PROJECTS.map(projectCardHtml).join("\n");

const videoWallHtml = FEATURED_VIDEOS.map((v) => {
  const href =
    v.kind === "short" ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
  return `<a class="vid ${v.kind === "short" ? "vid-short" : "vid-wide"}" href="${escapeHtml(href)}" target="_blank" rel="noopener" aria-label="Watch on YouTube: ${escapeHtml(v.title)}">
  <img src="https://i.ytimg.com/vi/${escapeHtml(v.id)}/maxresdefault.jpg" alt="" loading="lazy">
  <span class="vid-play" aria-hidden="true">▶</span>
  <span class="vid-title">${escapeHtml(v.title)}</span>
</a>`;
}).join("\n");

// ---- the page -------------------------------------------------------------

export const LANDING_HTML = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eric Backman — AI-native resume</title>
<meta name="description" content="${escapeHtml(META.what)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#0d1117; --panel:#161b22; --panel-2:#1c2330; --text:#e6edf3; --muted:#8b949e;
    --accent:#58a6ff; --violet:#bc8cff; --green:#3fb950; --cyan:#39c5cf;
    --border:#30363d; --border-glow:rgba(88,166,255,.35);
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    margin:0; background:var(--bg); color:var(--text);
    font-family:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    line-height:1.6; font-size:15px;
    background-image:
      radial-gradient(ellipse 60% 40% at 70% -10%, rgba(88,166,255,.13), transparent),
      radial-gradient(ellipse 50% 35% at 15% 5%, rgba(188,140,255,.09), transparent);
    background-repeat:no-repeat;
  }
  main { max-width:1020px; margin:0 auto; padding:56px 20px 90px; }
  a { color:var(--accent); text-decoration:none; }
  a:hover { text-decoration:underline; }
  .eyebrow { color:var(--muted); font-size:13px; letter-spacing:.08em; text-transform:uppercase; }
  h1 {
    font-size:clamp(2rem, 5vw, 3rem); margin:6px 0 2px; line-height:1.15;
    background:linear-gradient(92deg, var(--text) 20%, var(--accent) 60%, var(--violet) 95%);
    -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
  }
  .sub { color:var(--muted); margin-bottom:22px; font-size:15px; }
  .lede { max-width:72ch; }
  h2 { font-size:1.15rem; margin:56px 0 6px; }
  h2 .hash { color:var(--accent); margin-right:8px; }
  .section-note { color:var(--muted); font-size:13.5px; margin:0 0 18px; max-width:72ch; }

  /* stat tiles */
  .tiles { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:10px; margin:26px 0 8px; }
  .tile { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:12px 14px; }
  .tile-v { font-size:1.5rem; font-weight:700; color:var(--text); }
  .tile-l { font-size:12px; color:var(--muted); line-height:1.35; margin-top:2px; }

  /* terminal / playground */
  .term {
    background:#0a0e14; border:1px solid var(--border); border-radius:12px; overflow:hidden;
    box-shadow:0 0 0 1px rgba(88,166,255,.06), 0 0 42px rgba(88,166,255,.07);
  }
  .term-bar { display:flex; align-items:center; gap:8px; padding:10px 14px; background:var(--panel); border-bottom:1px solid var(--border); }
  .term-bar .b { width:11px; height:11px; border-radius:50%; opacity:.85; }
  .term-title { margin-left:6px; color:var(--muted); font-size:12.5px; }
  .term-out { padding:16px 18px; min-height:280px; max-height:460px; overflow-y:auto; font-size:13.5px; }
  .t-req { color:var(--cyan); white-space:pre-wrap; word-break:break-word; }
  .t-req::before { content:"▸ "; color:var(--muted); }
  .t-h1 { color:var(--violet); font-weight:700; margin-top:10px; }
  .t-h2 { color:var(--accent); font-weight:700; margin-top:10px; }
  .t-li { padding-left:18px; text-indent:-14px; }
  .t-li::before { content:"– "; color:var(--accent); }
  .t-p { white-space:pre-wrap; word-break:break-word; }
  .t-dim { color:var(--muted); }
  .t-err { color:#f85149; }
  .cursor { display:inline-block; width:8px; height:15px; background:var(--accent); vertical-align:text-bottom; animation:blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity:0; } }
  .chips { display:flex; flex-wrap:wrap; gap:8px; padding:12px 14px; border-top:1px solid var(--border); background:var(--panel); }
  .chip {
    font:inherit; font-size:12.5px; color:var(--text); background:var(--panel-2);
    border:1px solid var(--border); border-radius:999px; padding:5px 12px; cursor:pointer;
  }
  .chip:hover { border-color:var(--accent); }
  .chip.active { border-color:var(--accent); background:rgba(88,166,255,.12); }
  .chip:focus-visible, .card:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

  /* system map */
  .filters { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(290px,1fr)); gap:12px; }
  .card {
    background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:14px 16px;
    cursor:pointer; transition:transform .12s ease, border-color .12s ease, box-shadow .12s ease;
  }
  .card:hover { transform:translateY(-2px); border-color:var(--border-glow); box-shadow:0 4px 24px rgba(0,0,0,.35); }
  .card.hidden { display:none; }
  .card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .card h3 { margin:0 0 4px; font-size:15px; }
  .card p { margin:0; color:var(--muted); font-size:13px; }
  .card-numbers { margin-top:8px; font-size:12px; color:var(--text); opacity:.85; }
  .card-parts { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
  .part { font-size:11px; color:var(--muted); border:1px solid var(--border); border-radius:6px; padding:1px 7px; }
  .card-link { color:var(--muted); font-size:15px; }
  .card-link:hover { color:var(--accent); text-decoration:none; }
  .status { display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:var(--muted); }
  .status .dot { width:7px; height:7px; border-radius:50%; }
  .status-live .dot { background:var(--green); box-shadow:0 0 6px var(--green); animation:pulse 2.4s ease-in-out infinite; }
  .status-live { color:var(--green); }
  .status-scheduled .dot { background:var(--cyan); }
  .status-scheduled { color:var(--cyan); }
  .status-complete .dot { background:var(--muted); }
  @keyframes pulse { 50% { opacity:.45; } }

  /* video wall */
  .vid-wall { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
  .vid {
    position:relative; display:block; border-radius:12px; overflow:hidden;
    border:1px solid var(--border); background:var(--panel);
  }
  .vid:hover { border-color:var(--border-glow); }
  .vid img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .3s ease; }
  .vid:hover img { transform:scale(1.05); }
  .vid-short { aspect-ratio:9/16; }
  .vid-wide { grid-column:1/-1; aspect-ratio:21/9; }
  .vid-play {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:rgba(10,14,20,.62); border:1px solid rgba(230,237,243,.45); color:#fff; font-size:16px;
    padding-left:4px; transition:background .2s ease;
  }
  .vid:hover .vid-play { background:rgba(88,166,255,.75); }
  .vid-title {
    position:absolute; left:0; right:0; bottom:0; padding:26px 10px 9px; font-size:12px; color:#fff;
    background:linear-gradient(transparent, rgba(4,8,14,.85));
  }
  @media (max-width:640px) {
    .vid-wall { grid-template-columns:repeat(2, 1fr); }
  }
  @media (prefers-reduced-motion: reduce) {
    .vid img { transition:none; }
    .vid:hover img { transform:none; }
  }

  /* connect */
  pre {
    background:var(--panel); border:1px solid var(--border); border-radius:10px;
    padding:13px 15px; overflow-x:auto; font-size:13px; margin:8px 0 16px;
  }
  code { font-family:inherit; }
  .note {
    background:var(--panel); border:1px solid var(--border); border-left:3px solid var(--accent);
    border-radius:10px; padding:13px 16px; margin:22px 0; font-size:14px; max-width:100%;
  }
  footer { margin-top:64px; color:var(--muted); font-size:13px; border-top:1px solid var(--border); padding-top:18px; }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior:auto; }
    .status-live .dot, .cursor { animation:none; }
    .card { transition:none; }
  }
</style>
</head>
<body>
<main>
  <header>
    <div class="eyebrow">ai.ericbackman.com — an AI-native resume</div>
    <h1>${escapeHtml(PROFILE.name)}</h1>
    <div class="sub">${escapeHtml(PROFILE.title)} · ${escapeHtml(PROFILE.location)}</div>
    <p class="lede">${escapeHtml(META.why)}</p>
    <div class="tiles">
${statTilesHtml}
    </div>
    <p class="section-note">Numbers verified against the workspace on ${escapeHtml(META.written)} — counted from data files, not READMEs.</p>
  </header>

  <section id="playground">
    <h2><span class="hash">#</span>Query this resume</h2>
    <p class="section-note">This terminal talks to the real MCP endpoint on this domain. Click a tool. What your AI assistant would see is exactly what you'll see.</p>
    <div class="term">
      <div class="term-bar">
        <span class="b" style="background:#ff5f57"></span><span class="b" style="background:#febc2e"></span><span class="b" style="background:#28c840"></span>
        <span class="term-title">POST ${MCP_URL} · JSON-RPC 2.0 · no auth</span>
      </div>
      <div class="term-out" id="term-out" aria-live="polite"></div>
      <div class="chips" id="tool-chips">
${toolChipsHtml}
      </div>
    </div>
  </section>

  <section id="watch">
    <h2><span class="hash">#</span>Watch the output</h2>
    <p class="section-note">Live from the channel the Dive Shorts studio runs. Eric shot every frame; Claude reviewed the footage, cut and color-corrected each video, uploaded it, and scheduled its release. Tap to watch on YouTube.</p>
    <div class="vid-wall">
${videoWallHtml}
    </div>
    <p class="section-note" style="margin-top:10px">More at <a href="https://youtube.com/@backmandiving" target="_blank" rel="noopener">@backmandiving</a> — 111 videos uploaded by the pipeline so far.</p>
  </section>

  <section id="system">
    <h2><span class="hash">#</span>The system map</h2>
    <p class="section-note">The shipped projects, with their moving parts. Click any card to ask the server about it. A <span class="status status-live" style="display:inline-flex"><span class="dot"></span>live</span> badge means you can visit it right now; <span class="status status-scheduled" style="display:inline-flex"><span class="dot"></span>scheduled</span> means it runs unattended on a timer.</p>
    <div class="filters" id="filters">
${filterChipsHtml}
    </div>
    <div class="grid" id="grid">
${cardsHtml}
    </div>
  </section>

  <section id="connect">
    <h2><span class="hash">#</span>Connect your AI</h2>
    <p class="section-note">Paste a job description at your assistant and ask "is Eric a fit?" — the <code>get_skills_and_gaps</code> tool lists what he <strong>hasn't</strong> done, on purpose. Screen him on reality.</p>
    <p><strong>Claude (claude.ai):</strong> Settings → Connectors → Add custom connector → <code>${MCP_URL}</code></p>
    <p><strong>Claude Code:</strong></p>
    <pre><code>claude mcp add --transport http eric-backman ${MCP_URL}</code></pre>
    <p><strong>Any MCP client:</strong></p>
    <pre><code>{ "mcpServers": { "eric-backman": { "type": "http", "url": "${MCP_URL}" } } }</code></pre>
    <div class="note">
      <strong>Human?</strong> The prose version is at <a href="/resume.md">/resume.md</a> — a narrative resume written by Claude, in its own voice, from inside Eric's workspace.
      <strong>Crawler?</strong> <a href="/llms.txt">/llms.txt</a>.
      This page, the server, and the pipeline that verified its numbers are all part of the work sample: ${escapeHtml(META.how)}
    </div>
  </section>

  <footer>
    ${escapeHtml(PROFILE.name)} · <a href="mailto:${escapeHtml(PROFILE.email)}">${escapeHtml(PROFILE.email)}</a> ·
    <a href="${escapeHtml(PROFILE.github)}" target="_blank" rel="noopener">GitHub</a> ·
    <a href="${escapeHtml(PROFILE.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> ·
    <a href="${escapeHtml(PROFILE.website)}" target="_blank" rel="noopener">ericbackman.com</a> ·
    <a href="${escapeHtml(PROFILE.booking)}" target="_blank" rel="noopener">Book a call</a>
  </footer>
</main>

<script>
(function () {
  "use strict";
  var out = document.getElementById("term-out");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rpcId = 0;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Render one markdown-ish line into safe DOM (textContent only).
  function lineNode(line) {
    var cls = "t-p";
    var text = line;
    if (line.indexOf("# ") === 0) { cls = "t-h1"; text = line.slice(2); }
    else if (line.indexOf("## ") === 0) { cls = "t-h2"; text = line.slice(3); }
    else if (line.indexOf("- ") === 0) { cls = "t-li"; text = line.slice(2); }
    var node = el("div", cls);
    var chunks = text.split("**");
    for (var i = 0; i < chunks.length; i++) {
      if (i % 2 === 1) { node.appendChild(el("strong", "", chunks[i])); }
      else if (chunks[i] !== "") { node.appendChild(document.createTextNode(chunks[i])); }
    }
    return node;
  }

  function showResponse(text) {
    var lines = text.split("\\n");
    var frag = document.createDocumentFragment();
    for (var i = 0; i < lines.length; i++) frag.appendChild(lineNode(lines[i]));
    out.appendChild(frag);
    out.appendChild(el("div", "t-dim", ""));
    out.scrollTop = out.scrollHeight;
  }

  function typeRequest(label, done) {
    var node = el("div", "t-req");
    out.appendChild(node);
    out.scrollTop = out.scrollHeight;
    if (reduced) { node.textContent = label; done(); return; }
    var i = 0;
    var cur = el("span", "cursor");
    node.appendChild(cur);
    var timer = window.setInterval(function () {
      i++;
      node.textContent = label.slice(0, i);
      node.appendChild(cur);
      if (i >= label.length) { window.clearInterval(timer); cur.remove(); done(); }
    }, 14);
  }

  function callTool(name, args) {
    var label = 'tools/call · ' + name + (args && args.name ? ' · "' + args.name + '"' : "");
    typeRequest(label, function () {
      rpcId++;
      fetch("/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: rpcId, method: "tools/call", params: { name: name, arguments: args || {} } }),
      })
        .then(function (r) { return r.json(); })
        .then(function (body) {
          if (body.result && body.result.content && body.result.content[0]) {
            showResponse(body.result.content[0].text);
          } else if (body.error) {
            out.appendChild(el("div", "t-err", "error " + body.error.code + ": " + body.error.message));
          }
        })
        .catch(function (err) { out.appendChild(el("div", "t-err", "request failed: " + String(err))); });
    });
  }

  document.getElementById("tool-chips").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-tool]");
    if (!btn) return;
    var tool = btn.getAttribute("data-tool");
    callTool(tool, tool === "get_project" ? { name: "ai-resume" } : {});
  });

  // System map: click a card -> ask the server about it.
  function askAbout(slug) {
    document.getElementById("playground").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    callTool("get_project", { name: slug });
  }
  var grid = document.getElementById("grid");
  grid.addEventListener("click", function (ev) {
    var card = ev.target.closest(".card");
    if (card) askAbout(card.getAttribute("data-slug"));
  });
  grid.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var card = ev.target.closest(".card");
    if (card) { ev.preventDefault(); askAbout(card.getAttribute("data-slug")); }
  });

  // Filters
  document.getElementById("filters").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-filter]");
    if (!btn) return;
    var key = btn.getAttribute("data-filter");
    var chips = document.querySelectorAll(".filter-chip");
    for (var i = 0; i < chips.length; i++) {
      var active = chips[i] === btn;
      chips[i].classList.toggle("active", active);
      chips[i].setAttribute("aria-pressed", active ? "true" : "false");
    }
    var cards = document.querySelectorAll(".card");
    for (var j = 0; j < cards.length; j++) {
      var tags = (cards[j].getAttribute("data-tags") || "").split(" ");
      cards[j].classList.toggle("hidden", key !== "all" && tags.indexOf(key) === -1);
    }
  });

  // Opening demo: the server introduces itself.
  callTool("about", {});
})();
</script>
</body>
</html>`;

export const LLMS_TXT = `# Eric Backman — AI-native resume

> ${META.what}

${PROFILE.summary}

## For AI assistants

- MCP endpoint (Streamable HTTP, no auth, read-only): ${MCP_URL}
- Full narrative resume (markdown): https://ai.ericbackman.com/resume.md
- Start with the \`about\` tool, then \`get_resume\`, \`list_projects\`, \`get_project\`, \`get_bmo_work\`, \`get_workspace\`, \`get_skills_and_gaps\` (includes explicit gaps), \`get_contact\`.

## Contact

- Email: ${PROFILE.email}
- GitHub: ${PROFILE.github}
- LinkedIn: ${PROFILE.linkedin}
- Website: ${PROFILE.website}
- Book a call: ${PROFILE.booking}

Content verified against Eric's workspace on ${META.written}. ${String(PROJECTS.length)} projects listed; workspace: ${WORKSPACE.headline}
`;
