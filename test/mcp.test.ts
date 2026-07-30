import { describe, expect, it } from "vitest";
import { handleMessage, parseErrorResult, type McpServerSpec } from "../src/mcp";
import { buildServerSpec } from "../src/tools";

const spec: McpServerSpec = buildServerSpec("test");

function call(method: string, params?: unknown, id: number | string | null = 1) {
  return handleMessage(spec, { jsonrpc: "2.0", id, method, params });
}

function resultOf(res: ReturnType<typeof handleMessage>): Record<string, unknown> {
  expect(res.status).toBe(200);
  const body = res.body as Record<string, unknown>;
  expect(body["error"]).toBeUndefined();
  return body["result"] as Record<string, unknown>;
}

describe("protocol", () => {
  it("initialize echoes a supported protocol version", () => {
    const result = resultOf(call("initialize", { protocolVersion: "2025-03-26" }));
    expect(result["protocolVersion"]).toBe("2025-03-26");
    expect((result["serverInfo"] as Record<string, unknown>)["name"]).toBe("eric-backman-resume");
  });

  it("initialize falls back to latest for unknown versions", () => {
    const result = resultOf(call("initialize", { protocolVersion: "1999-01-01" }));
    expect(result["protocolVersion"]).toBe("2025-06-18");
  });

  it("acknowledges notifications with 202 and no body", () => {
    const res = handleMessage(spec, { jsonrpc: "2.0", method: "notifications/initialized" });
    expect(res).toEqual({ status: 202, body: null });
  });

  it("answers ping", () => {
    expect(resultOf(call("ping"))).toEqual({});
  });

  it("rejects unknown methods with -32601", () => {
    const res = call("resources/list");
    const error = (res.body as Record<string, unknown>)["error"] as Record<string, unknown>;
    expect(error["code"]).toBe(-32601);
  });

  it("rejects non-JSON-RPC bodies with -32600", () => {
    const res = handleMessage(spec, { hello: "world" });
    const error = (res.body as Record<string, unknown>)["error"] as Record<string, unknown>;
    expect(error["code"]).toBe(-32600);
  });

  it("has a parse error result with -32700", () => {
    const error = (parseErrorResult().body as Record<string, unknown>)["error"] as Record<string, unknown>;
    expect(error["code"]).toBe(-32700);
  });
});

describe("tools", () => {
  it("lists all tools with schemas and no handlers", () => {
    const result = resultOf(call("tools/list"));
    const tools = result["tools"] as Array<Record<string, unknown>>;
    expect(tools.length).toBe(spec.tools.length);
    for (const tool of tools) {
      expect(typeof tool["name"]).toBe("string");
      expect(typeof tool["description"]).toBe("string");
      expect(tool["inputSchema"]).toBeDefined();
      expect(tool["handler"]).toBeUndefined();
    }
  });

  it("every tool runs with empty args and returns non-empty content", () => {
    for (const tool of spec.tools) {
      const args = tool.name === "get_project" ? { name: "dive-map" } : {};
      const result = resultOf(call("tools/call", { name: tool.name, arguments: args }, tool.name));
      const content = result["content"] as Array<Record<string, unknown>>;
      expect(result["isError"]).toBe(false);
      expect(content.length).toBeGreaterThan(0);
      const first = content[0]!;
      if (first["type"] === "text") {
        expect((first["text"] as string).length).toBeGreaterThan(20);
      } else {
        expect(first["type"]).toBe("image");
        expect((first["data"] as string).length).toBeGreaterThan(1000);
      }
    }
  });

  it("show_dive_footage returns a GIF image block plus attribution text", () => {
    const result = resultOf(call("tools/call", { name: "show_dive_footage" }));
    const content = result["content"] as Array<Record<string, unknown>>;
    expect(content[0]!["type"]).toBe("image");
    expect(content[0]!["mimeType"]).toBe("image/gif");
    const b64 = content[0]!["data"] as string;
    expect(b64.length).toBeGreaterThan(100000);
    expect(b64.startsWith("R0lGOD")).toBe(true); // "GIF89a" magic, base64
    expect(content[1]!["type"]).toBe("text");
    expect(content[1]!["text"]).toContain("GoPro");
  });

  it("every tool is annotated read-only", () => {
    for (const tool of spec.tools) {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    }
  });

  it("rejects unknown tool names with -32602", () => {
    const res = call("tools/call", { name: "rm_rf" });
    const error = (res.body as Record<string, unknown>)["error"] as Record<string, unknown>;
    expect(error["code"]).toBe(-32602);
  });

  it("surfaces handler failures as isError results, not protocol errors", () => {
    const result = resultOf(call("tools/call", { name: "get_project", arguments: { name: "   " } }));
    expect(result["isError"]).toBe(true);
  });

  it("get_project fuzzy-matches names", () => {
    const result = resultOf(call("tools/call", { name: "get_project", arguments: { name: "dive map" } }));
    const content = result["content"] as Array<Record<string, unknown>>;
    expect(content[0]!["text"]).toContain("147 dives");
  });

  it("list_projects filters by tag", () => {
    const result = resultOf(call("tools/call", { name: "list_projects", arguments: { focus: "agentic-ai" } }));
    const content = result["content"] as Array<Record<string, unknown>>;
    expect(content[0]!["text"]).toContain("agentic-ai");
  });

  it("gaps are actually served", () => {
    const result = resultOf(call("tools/call", { name: "get_skills_and_gaps" }));
    const content = result["content"] as Array<Record<string, unknown>>;
    expect(content[0]!["text"]).toContain("hasn't");
    expect(content[0]!["text"]).toContain("Spark");
  });
});
