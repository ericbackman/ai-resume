// ai.ericbackman.com — Eric Backman's AI-native resume.
// Routes: /  /llms.txt  /resume.md  /mcp (MCP over Streamable HTTP)

import { handleMessage, parseErrorResult, type McpHttpResult } from "./mcp";
import { buildServerSpec } from "./tools";
import { LANDING_HTML, LLMS_TXT } from "./landing";
import { NARRATIVE } from "./narrative";

const VERSION = "1.0.0";
const SPEC = buildServerSpec(VERSION);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
};

function withCors(response: Response): Response {
  for (const [k, v] of Object.entries(CORS_HEADERS)) response.headers.set(k, v);
  return response;
}

function text(body: string, contentType: string, status = 200): Response {
  return new Response(body, { status, headers: { "Content-Type": contentType } });
}

function mcpResponse(result: McpHttpResult): Response {
  if (result.body === null) return new Response(null, { status: result.status });
  return Response.json(result.body, { status: result.status });
}

async function handleMcpPost(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return mcpResponse(parseErrorResult());
  }
  const result = handleMessage(SPEC, raw);
  const method = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>)["method"] : undefined;
  const params = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>)["params"] : undefined;
  const tool =
    typeof params === "object" && params !== null ? (params as Record<string, unknown>)["name"] : undefined;
  console.log(JSON.stringify({ event: "mcp", method, tool, status: result.status }));
  return mcpResponse(result);
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.hostname === "www.ericbackman.com") {
        url.hostname = "ericbackman.com";
        return Response.redirect(url.toString(), 301);
      }

      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }));
      }

      if (url.pathname === "/mcp") {
        if (request.method === "POST") return withCors(await handleMcpPost(request));
        // Stateless server: no SSE stream to offer on GET, no session to delete.
        return withCors(
          text("Method Not Allowed. POST a JSON-RPC message to this endpoint (MCP Streamable HTTP).", "text/plain", 405),
        );
      }

      if (request.method !== "GET") {
        return withCors(text("Method Not Allowed", "text/plain", 405));
      }

      switch (url.pathname) {
        case "/":
          return withCors(text(LANDING_HTML, "text/html; charset=utf-8"));
        case "/llms.txt":
          return withCors(text(LLMS_TXT, "text/plain; charset=utf-8"));
        case "/resume.md":
          return withCors(text(NARRATIVE, "text/markdown; charset=utf-8"));
        default:
          return withCors(text("Not found. Try /, /resume.md, /llms.txt, or POST /mcp.", "text/plain", 404));
      }
    } catch (err) {
      console.error(JSON.stringify({ event: "unhandled_error", error: String(err) }));
      return withCors(Response.json({ error: "Internal server error" }, { status: 500 }));
    }
  },
} satisfies ExportedHandler;
