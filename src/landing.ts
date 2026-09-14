// Human-facing landing page + llms.txt. All page HTML is generated at module
// scope from the same typed data the MCP tools serve, so page and tools can't
// drift. Client JS builds DOM via createElement/textContent only — no
// innerHTML with dynamic content, matching the workspace house rule.

import { PROFILE, META, PROJECTS, WORKSPACE, FEATURED_VIDEOS, TIMELINE, TIMELINE_INTRO, CHANNEL, type Project } from "./resume-data";
import { buildServerSpec, shortDate } from "./tools";
import { theme, type ThemeName } from "./tokens";

const MCP_URL = "https://ai.ericbackman.com/mcp";

// ---- house design system ---------------------------------------------------
// The page is one static string served by the Worker, so every theme is resolved
// at module scope and emitted as its own [data-theme] block rather than linked as
// a stylesheet. The visitor picks one; the choice only ever sets an attribute on
// <html>, so switching costs no request and no repaint beyond the cascade.
const COTTAGE_THEMES = ["shield", "greatroom", "ledgestone", "drone", "windowwall"] as const;
type CottageTheme = (typeof COTTAGE_THEMES)[number];

// Eric's designated palettes: greatroom is this site's dark mode, windowwall its
// light. That pairing is the design system's own, not an invention here --
// windowwall is greatroom's declared lightTwin -- so the assertion below fails the
// build if the two ever drift apart upstream.
const DARK_THEME: CottageTheme = "greatroom";
const LIGHT_THEME: CottageTheme = (() => {
  const twin = theme(DARK_THEME as ThemeName).lightTwin;
  if (twin !== "windowwall") {
    throw new Error(`expected windowwall as ${DARK_THEME}'s lightTwin, got ${String(twin)}`);
  }
  return twin;
})();

// Local-clock boundaries for the automatic switch: light through the working day,
// dark in the evening. Read from the visitor's own clock, so someone opening this
// from another timezone gets their evening, not Toronto's.
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 19;

// Serves as the no-JS fallback and as the :root block; the pre-paint script
// almost always replaces it with the time-appropriate choice.
const DEFAULT_THEME: CottageTheme = DARK_THEME;

const C = theme(DEFAULT_THEME as ThemeName).colors;

/** Blend two hex colours. t=0 returns a, t=1 returns b. */
function mix(a: string, b: string, t: number): string {
  const parse = (h: string): [number, number, number] => {
    const v = h.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(v)) throw new Error(`mix() expects a 6-digit hex, got ${h}`);
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
}

/**
 * n visually distinct colours drawn from the active theme. Tokens can collide
 * inside a single theme -- ledgestone gives --bd-accent, --bd-ink-2 and
 * --bd-line-2 all as #ADB1B6 -- so the base set is deduped before it is extended
 * by stepping each surviving hue toward the ground and then the ink. Without the
 * dedupe two timeline tracks silently share a colour.
 */
type Palette = Readonly<Record<string, string>>;

function categorical(c: Palette, n: number, label: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (v: string | undefined) => {
    if (!v) return;
    const k = v.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(v); }
  };
  (["accent", "accent-2", "gain", "warn", "loss", "line", "line-2", "ink-2"] as const).forEach((k) => push(c[k]));
  const base = out.slice();
  const ink = c["ink"], ground = c["ground"];
  if (!ink || !ground) throw new Error(`theme ${label} is missing ink/ground`);
  for (const t of [0.38, 0.3, 0.6]) {
    if (out.length >= n) break;
    const toward = t === 0.3 ? ink : ground;
    for (const v of base) { if (out.length < n) push(mix(v, toward, t)); }
  }
  if (out.length < n) throw new Error(`theme ${label} cannot yield ${n} distinct colours`);
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SPEC = buildServerSpec("0.0.0");

// ---- server-rendered fragments -------------------------------------------

// Verified against the workspace on 2026-08-10, same pass as resume-data.ts.
// Keep these in step with WORKSPACE.stats — they are the short form of it.
const STAT_TILES: Array<{ value: string; label: string }> = [
  { value: "50", label: "repos with real history (of 79 on disk)" },
  { value: "2,048", label: "commits in 2026" },
  { value: "587", label: "logged agent sessions" },
  { value: "45", label: "hostnames on the estate" },
  { value: "4", label: "MCP servers built" },
  { value: "49", label: "operational playbooks" },
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

// ---- timeline SVG (dark, JetBrains Mono, generated from TIMELINE) --------

// Seven tracks, seven theme-derived hues. Order is fixed so a given track keeps
// its slot across themes. The SVG references these as var(--tl-N), never as a
// literal, which is what lets the timeline follow a live theme switch.
const TL_TRACKS = ["sports", "dive", "bots", "cloudflare", "photos", "agents", "jobhunt"] as const;
const TL_INDEX: Record<string, number> = Object.fromEntries(TL_TRACKS.map((k, i) => [k, i]));

/** Relative luminance, WCAG 2.1. */
function luminance(hex: string): number {
  const v = hex.replace("#", "");
  const ch = (i: number) => {
    const x = parseInt(v.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Walk a hue toward the ink until it clears `target` against EVERY background it
 * can land on. Two things this guards against, both found by measuring rather
 * than reasoning: a fixed 45% lift leaves greatroom's and windowwall's fifth
 * timeline track at 4.2:1, and lifting against the ground alone still fails on
 * cards, because --surface is a different luminance from --ground in every theme.
 */
function liftForContrast(hue: string, ink: string, grounds: string[], target = 4.5): string {
  for (let t = 0.25; t <= 0.95; t += 0.05) {
    const c = mix(hue, ink, t);
    if (grounds.every((bg) => contrast(c, bg) >= target)) return c;
  }
  return ink;
}

/** `#rrggbb` at an alpha, as a literal rgba() -- see the note on themeVars(). */
function alpha(hex: string, a: number): string {
  const v = hex.replace("#", "");
  const ch = (i: number) => parseInt(v.slice(i, i + 2), 16);
  return `rgba(${ch(0)}, ${ch(2)}, ${ch(4)}, ${a})`;
}

/**
 * Every custom property for one theme.
 *
 * Everything here is a LITERAL value, computed at build time. That is
 * deliberate: Chrome does not re-resolve `color-mix(..., transparent)` when a
 * custom property it depends on changes, so a translucent tint written that way
 * freezes at whatever the theme was on first paint and never follows a live
 * switch. (Two-token `color-mix(a, b)` does invalidate correctly -- only the
 * `transparent` keyword form is stuck.) Emitting concrete values sidesteps the
 * whole class of bug, because swapping a plain custom property always works.
 */
function themeVars(name: CottageTheme): string {
  const c = theme(name as ThemeName).colors as Palette;
  const ink = c["ink"], ground = c["ground"], panel = c["panel"], raised = c["raised"];
  const accent = c["accent"], accent2 = c["accent-2"], gain = c["gain"];
  if (!ink || !ground || !panel || !raised || !accent || !accent2 || !gain) {
    throw new Error(`theme ${name} is missing a contract token`);
  }
  const parts = Object.entries(c).map(([k, v]) => `--bd-${k}:${v};`);

  // Card surfaces sit between panel and ground: a full --bd-panel fill puts
  // --bd-ink-2 under 4.5:1 in six of the seven themes, which the house gate
  // misses because it only ever tests against ground.
  const surface = mix(panel, ground, 0.68);
  const raisedSurface = mix(raised, ground, 0.62);
  parts.push(`--surface:${surface};`);
  parts.push(`--raised-surface:${raisedSurface};`);
  parts.push(`--bar-bg:${mix(panel, ground, 0.58)};`);

  // Hues that cannot carry small text on their own, lifted until they can. These
  // land on cards as well as on the page, so both surfaces are in the target set.
  const textOn = [ground, surface, raisedSurface];
  parts.push(`--green-ink:${liftForContrast(gain, ink, textOn)};`);
  parts.push(`--cyan-ink:${liftForContrast(accent2, ink, textOn)};`);
  parts.push(`--violet-ink:${liftForContrast(accent2, ink, textOn)};`);

  // Translucent derivatives.
  parts.push(`--border-glow:${alpha(accent, 0.55)};`);
  parts.push(`--wash-a:${alpha(accent, 0.14)};`);
  parts.push(`--wash-b:${alpha(accent2, 0.12)};`);
  parts.push(`--glow-ring:${alpha(accent, 0.12)};`);
  parts.push(`--glow-soft:${alpha(accent, 0.1)};`);
  parts.push(`--chip-active:${alpha(accent, 0.22)};`);
  parts.push(`--card-shadow:${alpha(ground, 0.7)};`);
  parts.push(`--bar-shadow:${alpha(ground, 0.5)};`);
  parts.push(`--scrim:${alpha(ground, 0.78)};`);
  parts.push(`--scrim-strong:${alpha(ground, 0.9)};`);
  parts.push(`--hairline:${alpha(ink, 0.55)};`);
  parts.push(`--play-hover:${alpha(accent, 0.82)};`);

  categorical(c, TL_TRACKS.length, name).forEach((hue, i) => {
    parts.push(`--tl-${i}:${hue};`);
    parts.push(`--tl-label-${i}:${liftForContrast(hue, ink, [ground])};`);
  });
  return parts.join(" ");
}

// :root carries the default so an un-stamped page is still fully styled.
const THEME_CSS = [
  `:root { ${themeVars(DEFAULT_THEME)} }`,
  ...COTTAGE_THEMES.map((t) => `[data-theme="${t}"] { ${themeVars(t)} }`),
].join("\n  ");

// Swatches must show each theme's own colours while a different theme is active,
// so they carry literal values -- taken from the design system, never invented.
const THEME_SWATCHES = COTTAGE_THEMES.map((t) => {
  const c = theme(t as ThemeName).colors as Palette;
  return {
    name: t,
    label: theme(t as ThemeName).label,
    mode: theme(t as ThemeName).mode,
    ground: c["ground"] ?? "#000000",
    panel: c["panel"] ?? "#000000",
    accent: c["accent"] ?? "#000000",
  };
});

const TL_X0 = 150;
const TL_X1 = 960;
const TL_EPOCH = Date.UTC(2026, 1, 1); // Feb 1, 2026
const TL_SPAN_DAYS = 212; // Feb 1 -> Sep 1

function tlX(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const days = (Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1) - TL_EPOCH) / 86400000;
  return Math.round(TL_X0 + (days * (TL_X1 - TL_X0)) / TL_SPAN_DAYS);
}

function buildTimelineSvg(): string {
  const laneTop = 110;
  const pitch = 96;
  const bottom = laneTop + (TIMELINE.length - 1) * pitch + 44;
  const height = bottom + 20;
  const parts: string[] = [];
  parts.push(
    `<svg viewBox="0 0 1000 ${height}" role="img" aria-label="Seven-track timeline, February to August 2026" style="min-width:920px;display:block;width:100%">`,
  );
  for (let m = 1; m <= 8; m++) {
    const x = tlX(`2026-0${m + 1}-01`);
    const label = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][m - 1];
    parts.push(
      `<line x1="${x}" y1="72" x2="${x}" y2="${bottom}" stroke="var(--bd-line)" stroke-width="1" stroke-dasharray="2,5"/>`,
      `<text x="${x}" y="58" font-size="12" fill="var(--bd-ink-2)" text-anchor="middle">${label}</text>`,
    );
  }
  TIMELINE.forEach((track, i) => {
    const y = laneTop + i * pitch;
    const slot = TL_INDEX[track.key] ?? i;
    const color = `var(--tl-${slot})`;
    const labelColor = `var(--tl-label-${slot})`;
    parts.push(
      `<text x="10" y="${y + 4}" font-size="14" font-weight="700" fill="${labelColor}">${escapeHtml(track.name)}</text>`,
      `<line x1="${TL_X0}" y1="${y}" x2="${TL_X1}" y2="${y}" stroke="${color}" stroke-width="1" opacity="0.5"/>`,
    );
    for (const e of track.events) {
      const x = tlX(e.date);
      const labelY = e.row === "above" ? y - 16 : e.row === "below" ? y + 24 : y + 40;
      const anchor = e.anchor === "end" ? `x="${TL_X1}" text-anchor="end"` : `x="${x}" text-anchor="middle"`;
      parts.push(`<circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/>`);
      if (e.row === "below2") {
        parts.push(`<line x1="${x}" y1="${y + 6}" x2="${x}" y2="${labelY - 10}" stroke="var(--bd-line)" stroke-width="1" stroke-dasharray="2,3"/>`);
      }
      parts.push(
        `<text ${anchor} y="${labelY}" font-size="12" fill="var(--bd-ink)">${escapeHtml(e.label)} <tspan fill="var(--bd-ink-2)">· ${escapeHtml(shortDate(e.date))}</tspan></text>`,
      );
    }
  });
  parts.push("</svg>");
  return parts.join("\n");
}

const timelineSvg = buildTimelineSvg();

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
<html lang="en" data-theme="${DEFAULT_THEME}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eric Backman — AI-native resume</title>
<meta name="description" content="${escapeHtml(META.what)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<script>
  // Runs before first paint, so neither a stored choice nor the day/night default
  // ever flashes the wrong theme first.
  (function () {
    var ok = ${JSON.stringify(COTTAGE_THEMES)};
    var DARK = ${JSON.stringify(DARK_THEME)}, LIGHT = ${JSON.stringify(LIGHT_THEME)};
    var DAY_START = ${DAY_START_HOUR}, DAY_END = ${DAY_END_HOUR};

    // Time of day on the VISITOR's clock, not the server's.
    function auto() {
      var h = new Date().getHours();
      return h >= DAY_START && h < DAY_END ? LIGHT : DARK;
    }

    var picked = null;
    try {
      picked = new URLSearchParams(location.search).get("theme") || localStorage.getItem("bd-theme");
    } catch (e) { /* private mode or a blocked URL API: fall through to auto */ }

    var explicit = !!picked && ok.indexOf(picked) !== -1;
    document.documentElement.setAttribute("data-theme", explicit ? picked : auto());

    // Handed to the picker below so the two share one definition of "auto".
    window.__bdTheme = { ok: ok, auto: auto, isExplicit: explicit };
  })();
</script>
<style>
  /* backman-design tokens, emitted from src/tokens.ts -- one block per theme */
  ${THEME_CSS}
  /* Local semantic names map onto those tokens -- no raw hex below this line.
     --panel is mixed back toward the ground because the house contrast gate only
     tests ink against --bd-ground: at full --bd-panel strength, --muted secondary
     text lands under 4.5:1 in six of the seven themes. */
  :root {
    --bg:var(--bd-ground);
    --panel:var(--surface);
    --panel-2:var(--raised-surface);
    --text:var(--bd-ink); --muted:var(--bd-ink-2);
    --accent:var(--bd-accent); --violet:var(--bd-accent-2);
    --green:var(--bd-gain); --cyan:var(--bd-accent-2);
    --border:var(--bd-line);
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    margin:0; background:var(--bg); color:var(--text);
    font-family:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    line-height:1.6; font-size:15px;
    background-image:
      radial-gradient(ellipse 60% 40% at 70% -10%, var(--wash-a), transparent),
      radial-gradient(ellipse 50% 35% at 15% 5%, var(--wash-b), transparent);
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
    background:var(--bd-ground); border:1px solid var(--border); border-radius:12px; overflow:hidden;
    box-shadow:0 0 0 1px var(--glow-ring), 0 0 42px var(--glow-soft);
  }
  .term-bar { display:flex; align-items:center; gap:8px; padding:10px 14px; background:var(--panel); border-bottom:1px solid var(--border); }
  .term-bar .b { width:11px; height:11px; border-radius:50%; opacity:.85; }
  .term-title { margin-left:6px; color:var(--muted); font-size:12.5px; }
  .term-out { padding:16px 18px; min-height:280px; max-height:460px; overflow-y:auto; font-size:13.5px; }
  .t-req { color:var(--cyan-ink); white-space:pre-wrap; word-break:break-word; }
  .t-req::before { content:"▸ "; color:var(--muted); }
  .t-h1 { color:var(--violet-ink); font-weight:700; margin-top:10px; }
  .t-h2 { color:var(--accent); font-weight:700; margin-top:10px; }
  .t-li { padding-left:18px; text-indent:-14px; }
  .t-li::before { content:"– "; color:var(--accent); }
  .t-p { white-space:pre-wrap; word-break:break-word; }
  .t-dim { color:var(--muted); }
  .t-err { color:color-mix(in srgb, var(--bd-loss) 55%, var(--bd-ink)); }
  .cursor { display:inline-block; width:8px; height:15px; background:var(--accent); vertical-align:text-bottom; animation:blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity:0; } }
  .chips { display:flex; flex-wrap:wrap; gap:8px; padding:12px 14px; border-top:1px solid var(--border); background:var(--panel); }
  .chip {
    font:inherit; font-size:12.5px; color:var(--text); background:var(--panel-2);
    border:1px solid var(--border); border-radius:999px; padding:5px 12px; cursor:pointer;
  }
  .chip:hover { border-color:var(--accent); }
  .chip.active { border-color:var(--accent); background:var(--chip-active); }
  .chip:focus-visible, .card:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }

  /* system map */
  .filters { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(290px,1fr)); gap:12px; }
  .card {
    background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:14px 16px;
    cursor:pointer; transition:transform .12s ease, border-color .12s ease, box-shadow .12s ease;
  }
  .card:hover { transform:translateY(-2px); border-color:var(--border-glow); box-shadow:0 4px 24px var(--card-shadow); }
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
  .status-live { color:var(--green-ink); }
  .status-scheduled .dot { background:var(--cyan); }
  .status-scheduled { color:var(--cyan-ink); }
  .status-complete .dot { background:var(--muted); }
  @keyframes pulse { 50% { opacity:.45; } }

  /* timeline */
  .tl-wrap {
    overflow-x:auto; background:var(--panel); border:1px solid var(--border);
    border-radius:12px; padding:16px 8px;
  }
  .tl-wrap svg text { font-family:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

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
    background:var(--scrim); border:1px solid var(--hairline); color:var(--bd-ink); font-size:16px;
    padding-left:4px; transition:background .2s ease;
  }
  .vid:hover .vid-play { background:var(--play-hover); }
  .vid-title {
    position:absolute; left:0; right:0; bottom:0; padding:26px 10px 9px; font-size:12px; color:var(--bd-ink);
    background:linear-gradient(transparent, var(--scrim-strong));
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

  /* theme picker */
  .themebar {
    position:fixed; top:12px; right:12px; z-index:50; display:flex; align-items:center; gap:8px;
    background:var(--bar-bg);
    border:1px solid var(--border); border-radius:999px; padding:6px 10px 6px 12px;
    box-shadow:0 2px 14px var(--bar-shadow);
  }
  .themebar-auto {
    font:inherit; font-size:11px; letter-spacing:.07em; text-transform:uppercase;
    color:var(--text); background:transparent; border:1px solid var(--border);
    border-radius:999px; padding:3px 9px; cursor:pointer;
  }
  .themebar-auto[aria-pressed="true"] { background:var(--chip-active); border-color:var(--bd-accent); }
  .themebar-auto:focus-visible { outline:2px solid var(--bd-ink); outline-offset:3px; }
  .themebar-sw { display:flex; gap:5px; }
  .sw {
    width:24px; height:24px; border-radius:50%; cursor:pointer; padding:0;
    border:1px solid var(--border); position:relative; overflow:hidden;
  }
  /* Each swatch shows its OWN theme: ground on the left, accent on the right. */
  .sw i { position:absolute; inset:0; display:block; }
  .sw i.b { left:50%; }
  .sw:hover { transform:scale(1.12); }
  .sw[aria-pressed="true"] { box-shadow:0 0 0 2px var(--bd-ground), 0 0 0 4px var(--bd-ink); }
  .sw:focus-visible { outline:2px solid var(--bd-ink); outline-offset:3px; }
  .themebar-name { font-size:11.5px; color:var(--muted); min-width:74px; }
  @media (prefers-reduced-motion: reduce) { .sw:hover { transform:none; } }
  @media (max-width:720px) {
    .themebar { top:auto; bottom:10px; right:10px; left:10px; justify-content:center; border-radius:14px; }
    .themebar-name { display:none; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior:auto; }
    .status-live .dot, .cursor { animation:none; }
    .card { transition:none; }
  }
</style>
</head>
<body>
<nav class="themebar" aria-label="Colour theme">
  <button class="themebar-auto" data-theme-auto type="button" aria-pressed="true"
    title="Follow the time of day: light ${DAY_START_HOUR}:00-${DAY_END_HOUR}:00, dark otherwise"
    aria-label="Automatic theme, following the time of day">Auto</button>
  <span class="themebar-sw">
    ${THEME_SWATCHES.map((t) => `<button class="sw" data-theme-pick="${escapeHtml(t.name)}" type="button"
      aria-pressed="${t.name === DEFAULT_THEME ? "true" : "false"}"
      title="${escapeHtml(t.label)} (${escapeHtml(t.mode)})" aria-label="${escapeHtml(t.label)} theme, ${escapeHtml(t.mode)}"
      ><i style="background:${escapeHtml(t.ground)}"></i><i class="b" style="background:${escapeHtml(t.accent)}"></i></button>`).join("\n    ")}
  </span>
  <span class="themebar-name" id="themeName">${escapeHtml(THEME_SWATCHES.find((t) => t.name === DEFAULT_THEME)?.label ?? "")}</span>
</nav>
<main>
  <header>
    <div class="eyebrow">an AI-native resume</div>
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
        <span class="b" style="background:var(--bd-loss)"></span><span class="b" style="background:var(--bd-warn)"></span><span class="b" style="background:var(--bd-gain)"></span>
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
    <p class="section-note">Live from the channel the Scuba Sessions studio runs. Eric shot every frame; Claude reviewed the footage, cut and color-corrected each video, uploaded it, and scheduled its release. Tap to watch on YouTube.</p>
    <div class="vid-wall">
${videoWallHtml}
    </div>
    <p class="section-note" style="margin-top:10px">More at <a href="${CHANNEL.url}" target="_blank" rel="noopener">${escapeHtml(CHANNEL.handle)}</a> — ${CHANNEL.videosPublic} videos public, all cut and scheduled by the pipeline.</p>
  </section>

  <section id="timeline">
    <h2><span class="hash">#</span>177 days</h2>
    <p class="section-note">${escapeHtml(TIMELINE_INTRO)} Seven tracks, each one a question that kept getting answered. Your AI can read the same story via the <code>get_timeline</code> tool.</p>
    <div class="tl-wrap">
${timelineSvg}
    </div>
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
    <h2><span class="hash">#</span>Ask your AI about Eric</h2>
    <p class="section-note">The honest screen: the server lists what he <strong>hasn't</strong> done alongside what he has. Two ways in; the first needs zero setup.</p>
    <p><strong>No setup, any AI.</strong> Paste this into Claude, ChatGPT, or anything that reads a URL:</p>
    <pre><code>Read https://ericbackman.com/resume.md and https://ericbackman.com/llms.txt,
then tell me whether Eric fits this role: [paste the job description]</code></pre>
    <p><strong>MCP connector, if you want the real thing.</strong> Endpoint: <code>${MCP_URL}</code></p>
    <p>Claude: Settings → Connectors → Add custom connector. Claude Code:</p>
    <pre><code>claude mcp add --transport http eric-backman ${MCP_URL}</code></pre>
    <p>Any MCP client:</p>
    <pre><code>{ "mcpServers": { "eric-backman": { "type": "http", "url": "${MCP_URL}" } } }</code></pre>
    <p class="section-note">Your assistant may ask you to approve the first tool call — that's your AI being properly cautious with an unfamiliar server, not something this server can waive. Every tool is read-only and says so in its MCP annotations. One approved call to <code>about</code> returns the complete brief; approving it "always" makes the rest seamless.</p>
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

  // ---- theme picker -------------------------------------------------------
  // Switching only sets an attribute on <html>; every colour on the page is a
  // custom property, so the whole document (timeline SVG included) follows the
  // cascade with no re-render and no refetch.
  var THEME_LABELS = ${JSON.stringify(Object.fromEntries(THEME_SWATCHES.map((t) => [t.name, t.label])))};
  var themeName = document.getElementById("themeName");
  var autoBtn = document.querySelector("[data-theme-auto]");
  var bd = window.__bdTheme || { auto: function () { return ${JSON.stringify(DEFAULT_THEME)}; }, isExplicit: false };

  function paint(name, isAuto) {
    if (!THEME_LABELS[name]) return;
    document.documentElement.setAttribute("data-theme", name);
    if (themeName) themeName.textContent = isAuto ? "Auto · " + THEME_LABELS[name] : THEME_LABELS[name];
    var picks = document.querySelectorAll("[data-theme-pick]");
    for (var i = 0; i < picks.length; i++) {
      picks[i].setAttribute("aria-pressed", !isAuto && picks[i].getAttribute("data-theme-pick") === name ? "true" : "false");
    }
    if (autoBtn) autoBtn.setAttribute("aria-pressed", isAuto ? "true" : "false");
  }

  function choose(name) {
    paint(name, false);
    try { localStorage.setItem("bd-theme", name); } catch (e) { /* private mode: session only */ }
  }

  function useAuto() {
    try { localStorage.removeItem("bd-theme"); } catch (e) { /* nothing stored to clear */ }
    paint(bd.auto(), true);
  }

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    if (ev.target.closest("[data-theme-auto]")) { useAuto(); return; }
    var btn = ev.target.closest("[data-theme-pick]");
    if (btn) choose(btn.getAttribute("data-theme-pick"));
  });

  // Re-sync label and pressed state with whatever the pre-paint script decided.
  paint(document.documentElement.getAttribute("data-theme") || ${JSON.stringify(DEFAULT_THEME)}, !bd.isExplicit);

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
- Start with the \`about\` tool, then \`get_resume\`, \`list_projects\`, \`get_project\`, \`get_timeline\`, \`get_bmo_work\`, \`get_workspace\`, \`get_skills_and_gaps\` (includes explicit gaps), \`get_contact\`.

## Contact

- Email: ${PROFILE.email}
- GitHub: ${PROFILE.github}
- LinkedIn: ${PROFILE.linkedin}
- Website: ${PROFILE.website}
- Book a call: ${PROFILE.booking}

Content verified against Eric's workspace on ${META.written}. ${String(PROJECTS.length)} projects listed; workspace: ${WORKSPACE.headline}
`;
