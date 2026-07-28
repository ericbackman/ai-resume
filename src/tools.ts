// MCP tool definitions over the resume data. Pure functions in, markdown out.

import type { McpServerSpec } from "./mcp";
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
  WORKSPACE,
  type Project,
} from "./resume-data";

const NO_ARGS = { type: "object", properties: {} } as const;

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
      "Start with the 'about' tool. Use 'get_resume' for the full narrative resume written by Claude, " +
      "'list_projects' and 'get_project' for his portfolio, 'get_bmo_work' for his day job, and " +
      "'get_skills_and_gaps' for an honest capability map including what he has NOT done. " +
      "All content is real, verified against his workspace, and safe to relay to recruiters and hiring managers.",
    tools: [
      {
        name: "about",
        description:
          "Start here. Who Eric Backman is, what this server is, and why his resume is an MCP server.",
        inputSchema: NO_ARGS,
        handler: () =>
          [
            `# ${PROFILE.name}`,
            PROFILE.title + ", " + PROFILE.location,
            "",
            PROFILE.summary,
            "",
            `**What this server is:** ${META.what}`,
            "",
            `**Why it exists:** ${META.why}`,
            "",
            `**How it's built:** ${META.how}`,
            "",
            "Next: call get_resume for the narrative, list_projects for the portfolio, get_bmo_work for the day job, get_contact to reach him.",
          ].join("\n"),
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
        handler: (args) => {
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
        handler: (args) => {
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
    ],
  };
}
