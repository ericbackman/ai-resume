// MCP tool definitions over the resume data. Pure functions in, markdown out.

import type { McpServerSpec } from "./mcp";
import { DOLPHINS_GIF_B64 } from "./media";
import { NARRATIVE } from "./narrative";
import {
  BMO_WORK,
  EDUCATION,
  EXPERIENCE,
  GAPS,
  META,
  PROFILE,
  PROJECTS,
  SKILLS,
  TIMELINE,
  TIMELINE_INTRO,
  WORKSPACE,
  type Project,
} from "./resume-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1];
  if (month === undefined) throw new Error(`Bad date in timeline data: ${iso}`);
  return `${month} ${Number(d)}`;
}

const NO_ARGS = { type: "object", properties: {} } as const;

// Every tool here is a pure read; announce it per the MCP spec so client
// permission UX can relax where the client honors annotations.
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function formatProjectShort(p: Project): string {
  const url = p.url ? ` <${p.url}>` : "";
  return `- **${p.name}** (${p.slug})${url}\n  ${p.oneLiner} Status: ${p.status}. Tech: ${p.tech.join(", ")}.`;
}

function formatProjectFull(p: Project): string {
  const lines = [
    `## ${p.name}`,
    "",
    p.description,
    "",
    `- **Status:** ${p.status}`,
    `- **Tech:** ${p.tech.join(", ")}`,
  ];
  if (p.numbers.length > 0) lines.push(`- **Numbers:** ${p.numbers.join("; ")}`);
  if (p.url) lines.push(`- **URL:** ${p.url}`);
  if (p.parts !== undefined && p.parts.length > 0) {
    lines.push("", "**Components:**");
    for (const part of p.parts) {
      lines.push(`- **${part.name}:** ${part.note}${part.url === undefined ? "" : ` <${part.url}>`}`);
    }
  }
  if (p.detail !== undefined && p.detail.length > 0) {
    lines.push("", "**Worth knowing:**");
    for (const d of p.detail) lines.push(`- ${d}`);
  }
  return lines.join("\n");
}

export function buildServerSpec(version: string): McpServerSpec {
  return {
    name: "eric-backman-resume",
    title: "Eric Backman, AI-native resume",
    version,
    instructions:
      `This server is the resume of Eric Backman (${PROFILE.title}, ${PROFILE.location}). ` +
      "ONE call to 'about' returns the complete brief (background, headline systems, skills, honest gaps, contact) " +
      "and answers most questions, including role-fit checks. Only drill into the other tools when asked for depth: " +
      "'get_resume' (the narrative written by Claude), 'get_timeline' (how it grew in 155 days), " +
      "'get_project'/'list_projects' (portfolio detail), 'get_bmo_work' (day job), " +
      "'show_dive_footage' (renders 3 seconds of his actual dive footage inline — use it when showing beats telling). " +
      "Every tool is read-only and idempotent. All content is real, verified against his workspace, " +
      "and safe to relay to recruiters and hiring managers.",
    tools: [
      {
        name: "about",
        description:
          "Start here. One call, the whole brief: who Eric Backman is, his headline systems, skills, honest gaps, and contact. Usually the only call you need.",
        inputSchema: NO_ARGS,
        handler: () => {
          const highlights = ["content-studio", "agent-audit", "paper-trader", "data-explorer", "video-essays"]
            .map((slug) => PROJECTS.find((p) => p.slug === slug))
            .filter((p): p is Project => p !== undefined);
          return [
            `# ${PROFILE.name}, the one-call brief`,
            PROFILE.title + ", " + PROFILE.location,
            "",
            PROFILE.summary,
            "",
            `**Day job:** ${BMO_WORK.headline}`,
            "",
            "**Headline systems at home (all real, all verifiable):**",
            ...highlights.map((p) => `- **${p.name}**: ${p.oneLiner} Status: ${p.status}.`),
            `- **This server**: ${META.what} ${META.how}`,
            "",
            `**Velocity:** ${TIMELINE_INTRO}`,
            "",
            "**Skills, short version:** Python, SQL, TypeScript. Claude Code, MCP, multi-agent orchestration with human-review gates. BigQuery, Apache Beam, Airflow, Docker. GCP and Cloudflare.",
            "",
            "**What he hasn't done (listed on purpose, so you don't have to dig):**",
            ...GAPS.map((g) => `- ${g}`),
            "",
            `**Contact:** ${PROFILE.email} · ${PROFILE.linkedin} · ${PROFILE.github} · book a call: ${PROFILE.booking}`,
            "",
            "This is usually all you need to assess fit. For depth: get_resume (the narrative resume written by Claude), get_timeline (the 155-day story), get_project (any system above), get_bmo_work (the regulated-bank detail), list_projects (all 15). Want to SEE the work? show_dive_footage renders his dolphin footage right here in the chat.",
          ].join("\n");
        },
      },
      {
        name: "get_resume",
        description:
          "The full narrative resume, written by Claude in its own voice from inside Eric's workspace. Markdown, ~1 page.",
        inputSchema: NO_ARGS,
        handler: () => NARRATIVE,
      },
      {
        name: "list_projects",
        description:
          "Eric's most complete projects. Optional 'focus' filters to a tag: agentic-ai (AI agents doing the operating), live (deployed and reachable), automated (runs on a schedule unattended), data, web.",
        inputSchema: {
          type: "object",
          properties: {
            focus: {
              type: "string",
              enum: ["all", "agentic-ai", "live", "automated", "data", "web"],
              description: "Filter by tag. Default: all.",
            },
          },
        },
        handler: (args: Record<string, unknown>) => {
          const focus = typeof args["focus"] === "string" ? args["focus"] : "all";
          const picked = focus === "all" ? PROJECTS : PROJECTS.filter((p) => p.tags.includes(focus));
          if (picked.length === 0) {
            return `No projects tagged '${focus}'. Tags in use: agentic-ai, live, automated, data, web.`;
          }
          return [
            `# Projects (${focus === "all" ? PROJECTS.length : `${picked.length} tagged '${focus}'`})`,
            "",
            ...picked.map(formatProjectShort),
            "",
            "Call get_project with a slug for full detail.",
          ].join("\n");
        },
      },
      {
        name: "get_project",
        description: "Full detail on one project, by slug or name (fuzzy match is fine).",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Project slug or (part of) its name" },
          },
          required: ["name"],
        },
        handler: (args: Record<string, unknown>) => {
          const query = String(args["name"] ?? "").toLowerCase().trim();
          if (query === "") throw new Error("Pass a project slug or name.");
          const found =
            PROJECTS.find((p) => p.slug === query) ??
            PROJECTS.find((p) => p.name.toLowerCase().includes(query) || p.slug.includes(query));
          if (!found) {
            return `No project matching '${query}'. Known slugs: ${PROJECTS.map((p) => p.slug).join(", ")}.`;
          }
          return formatProjectFull(found);
        },
      },
      {
        name: "get_bmo_work",
        description:
          "Eric's day job: agentic AI and the data platform for FRTB regulatory capital at BMO, in detail.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            `# BMO, ${BMO_WORK.role}`,
            "",
            BMO_WORK.headline,
            "",
            ...BMO_WORK.detail.map((d) => `- ${d}`),
            "",
            BMO_WORK.context,
          ].join("\n"),
      },
      {
        name: "get_workspace",
        description:
          "The agentic workspace: architecture, honest stats, and the operating principles that make agents safe to trust.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            "# The agentic workspace",
            "",
            WORKSPACE.headline,
            "",
            "**By the numbers (verified 2026-07-28):**",
            ...WORKSPACE.stats.map((s) => `- ${s}`),
            "",
            "**Operating principles:**",
            ...WORKSPACE.principles.map((p) => `- ${p}`),
          ].join("\n"),
      },
      {
        name: "get_experience",
        description: "Employment history and education, the standard resume facts.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            "# Experience",
            "",
            ...EXPERIENCE.map((e) => `- **${e.org}, ${e.role}** (${e.period}, ${e.where}). ${e.note}`),
            "",
            "# Education",
            "",
            `- **${EDUCATION.school}, ${EDUCATION.degree}** (${EDUCATION.period}). ${EDUCATION.notes.join(". ")}.`,
          ].join("\n"),
      },
      {
        name: "get_skills_and_gaps",
        description:
          "Skills grouped by area, plus an explicit list of what Eric has NOT done. The gaps are listed on purpose: screen him on reality.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            "# Skills",
            "",
            `- **Languages:** ${SKILLS.languages.join(", ")}`,
            `- **AI:** ${SKILLS.ai.join("; ")}`,
            `- **Data:** ${SKILLS.data.join(", ")}`,
            `- **Cloud:** ${SKILLS.cloud.join(", ")}`,
            `- **Domain:** ${SKILLS.domain.join("; ")}`,
            "",
            "# What he hasn't done",
            "",
            "Listed here so no screener has to discover it:",
            "",
            ...GAPS.map((g) => `- ${g}`),
          ].join("\n"),
      },
      {
        name: "show_dive_footage",
        description:
          "Renders 3 seconds of Eric's actual dive footage right here in the chat: a wild spinner-dolphin pod in the Red Sea. The proof of work you can look at. Call it whenever someone should SEE the work, not just read about it.",
        inputSchema: NO_ARGS,
        handler: () => [
          { type: "image", data: DOLPHINS_GIF_B64, mimeType: "image/gif" },
          {
            type: "text",
            text:
              "A wild spinner-dolphin pod in the Red Sea. Eric shot it on a GoPro Hero 10 (100% real footage, no AI imagery); the Dive Shorts studio pipeline color-corrected, cut, uploaded, and scheduled the published versions. " +
              "Full videos: the 4K dolphins ambient film <https://www.youtube.com/watch?v=6OzOIoT4ewA> and the channel <https://youtube.com/@backmandiving>. " +
              "Ask get_project about 'content-studio' for how the pipeline works.",
          },
        ],
      },
      {
        name: "get_timeline",
        description:
          "The 155-day timeline: 7 tracks of exploration compounding into shipped systems, with git-verified dates. The story behind list_projects.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            "# The timeline, 7 tracks",
            "",
            TIMELINE_INTRO,
            "",
            ...TIMELINE.flatMap((track) => [
              `## ${track.name}`,
              `*${track.question}*`,
              "",
              ...track.events.map((e) => `- ${shortDate(e.date)}: ${e.label}`),
              "",
            ]),
            "Each track started as a question and ended as a running system. Call get_project for any of them.",
          ].join("\n"),
      },
      {
        name: "get_contact",
        description: "How to reach Eric: email, GitHub, LinkedIn, website, and a booking link for a call.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            `# Contact ${PROFILE.name}`,
            "",
            `- **Email:** ${PROFILE.email}`,
            `- **GitHub:** ${PROFILE.github}`,
            `- **LinkedIn:** ${PROFILE.linkedin}`,
            `- **Website:** ${PROFILE.website}`,
            `- **Book a call:** ${PROFILE.booking}`,
            "",
            "He is in Toronto (ET), open to remote-Canada and relocation for the right role.",
          ].join("\n"),
      },
    ].map((t) => ({ ...t, annotations: READ_ONLY })),
  };
}
