#!/usr/bin/env node
/**
 * Notion MCP Server — Token-optimized fork
 * 
 * A lightweight fork of suekou/mcp-notion-server with aggressively
 * slimmed-down tool schemas (~63% smaller) and Streamable HTTP transport
 * for remote deployment.
 *
 * Supports two transport modes:
 * - stdio: Local use with Claude Desktop, Cursor, etc. (default)
 * - http:  Remote deployment via Streamable HTTP
 *
 * Command-line arguments:
 * --transport: "stdio" (default) or "http"
 * --port: HTTP port (default 3000, also reads PORT env var)
 * --enabledTools: Comma-separated list of tools to enable
 *
 * Environment variables:
 * - NOTION_API_TOKEN: Required — Notion Integration Token
 * - NOTION_MARKDOWN_CONVERSION: Optional — "true" to enable Markdown output
 * - PORT: HTTP port (overridden by --port)
 * - ENABLED_TOOLS: Comma-separated tool list (overridden by --enabledTools)
 * - MCP_AUTH_TOKEN: Optional — Bearer token for HTTP auth
 */
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { startServer } from "./server/index.js";

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("enabledTools", {
    type: "string",
    description: "Comma-separated list of tools to enable",
  })
  .option("transport", {
    type: "string",
    choices: ["stdio", "http"],
    default: "stdio",
    description: "Transport type: stdio (local) or http (remote)",
  })
  .option("port", {
    type: "number",
    description: "HTTP port (default: 3000 or PORT env var)",
  })
  .parseSync();

const enabledToolsRaw = argv.enabledTools || process.env.ENABLED_TOOLS || "";
const enabledToolsSet = new Set(
  enabledToolsRaw ? enabledToolsRaw.split(",").map((s: string) => s.trim()).filter(Boolean) : []
);

// if test environment, do not execute main()
if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
}

async function main() {
  const notionToken = process.env.NOTION_API_TOKEN;
  const enableMarkdownConversion =
    process.env.NOTION_MARKDOWN_CONVERSION === "true";

  if (!notionToken) {
    console.error("Please set NOTION_API_TOKEN environment variable");
    process.exit(1);
  }

  const transportType = (argv.transport as "stdio" | "http") || "stdio";
  const httpPort = argv.port || parseInt(process.env.PORT || "3000", 10);
  const authToken = process.env.MCP_AUTH_TOKEN || undefined;

  await startServer(
    notionToken,
    enabledToolsSet,
    enableMarkdownConversion,
    transportType,
    httpPort,
    authToken
  );
}
