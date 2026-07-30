// Minimal stateless MCP server core: JSON-RPC 2.0 over Streamable HTTP,
// spec revision 2025-06-18 (also accepts 2025-03-26 and 2024-11-05 clients).
// No sessions, no SSE — every request is a single POST with a JSON response.
// Hand-rolled instead of an SDK on purpose: this repo is a public work sample,
// and the whole protocol surface a read-only resume needs fits in this file.

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** MCP tool annotations (readOnlyHint etc.) — hints for client permission UX. */
  annotations?: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => string;

export interface McpServerSpec {
  name: string;
  title: string;
  version: string;
  instructions: string;
  tools: Array<ToolDef & { handler: ToolHandler }>;
}

interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: unknown;
}

export interface McpHttpResult {
  status: number;
  body: Record<string, unknown> | null;
}

const LATEST_PROTOCOL = "2025-06-18";
const SUPPORTED_PROTOCOLS = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;

function rpcError(id: number | string | null, code: number, message: string): McpHttpResult {
  return { status: 200, body: { jsonrpc: "2.0", id, error: { code, message } } };
}

function rpcResult(id: number | string | null, result: Record<string, unknown>): McpHttpResult {
  return { status: 200, body: { jsonrpc: "2.0", id, result } };
}

export function parseErrorResult(): McpHttpResult {
  return rpcError(null, PARSE_ERROR, "Parse error: body is not valid JSON");
}

function isJsonRpcMessage(value: unknown): value is JsonRpcMessage {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const msg = value as Record<string, unknown>;
  return msg["jsonrpc"] === "2.0" && typeof msg["method"] === "string";
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/** Dispatch one decoded POST body. Pure: no I/O, no shared state. */
export function handleMessage(spec: McpServerSpec, raw: unknown): McpHttpResult {
  if (!isJsonRpcMessage(raw)) {
    return rpcError(null, INVALID_REQUEST, "Invalid Request: expected a single JSON-RPC 2.0 message");
  }

  // Notifications (no id) get acknowledged with 202 and no body.
  if (raw.id === undefined || raw.id === null) {
    return { status: 202, body: null };
  }
  const id = raw.id;
  const params = asRecord(raw.params);

  switch (raw.method) {
    case "initialize": {
      const requested = typeof params["protocolVersion"] === "string" ? params["protocolVersion"] : "";
      const protocolVersion = SUPPORTED_PROTOCOLS.has(requested) ? requested : LATEST_PROTOCOL;
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: spec.name, title: spec.title, version: spec.version },
        instructions: spec.instructions,
      });
    }

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, {
        tools: spec.tools.map(({ name, description, inputSchema, annotations }) => ({
          name,
          description,
          inputSchema,
          ...(annotations === undefined ? {} : { annotations }),
        })),
      });

    case "tools/call": {
      const toolName = params["name"];
      if (typeof toolName !== "string") {
        return rpcError(id, INVALID_PARAMS, "tools/call requires a string 'name' param");
      }
      const tool = spec.tools.find((t) => t.name === toolName);
      if (!tool) {
        const known = spec.tools.map((t) => t.name).join(", ");
        return rpcError(id, INVALID_PARAMS, `Unknown tool '${toolName}'. Available: ${known}`);
      }
      try {
        const text = tool.handler(asRecord(params["arguments"]));
        return rpcResult(id, { content: [{ type: "text", text }], isError: false });
      } catch (err) {
        // Tool-level failures are results, not protocol errors, per the MCP spec.
        return rpcResult(id, {
          content: [{ type: "text", text: `Tool '${toolName}' failed: ${String(err)}` }],
          isError: true,
        });
      }
    }

    default:
      return rpcError(id, METHOD_NOT_FOUND, `Method not found: ${raw.method}`);
  }
}
