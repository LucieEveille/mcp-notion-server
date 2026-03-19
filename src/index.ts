#!/usr/bin/env node
/**
 * Notion MCP Server — 露露的精简版
 * 
 * 支持两种传输模式：
 * - stdio: 本地运行（默认）
 * - http:  远程部署，Streamable HTTP，供 Claude 等客户端远程连接
 *
 * 命令行参数：
 * --transport: "stdio" (默认) 或 "http"
 * --port: HTTP 端口（默认 3000，也读 PORT 环境变量）
 * --enabledTools: 逗号分隔的工具列表（不指定则启用全部）
 *
 * 环境变量：
 * - NOTION_API_TOKEN: 必填，Notion Integration Token
 * - NOTION_MARKDOWN_CONVERSION: 可选，"true" 启用 Markdown 转换（省 token）
 * - PORT: HTTP 端口（被 --port 覆盖）
 * - MCP_AUTH_TOKEN: 可选，HTTP 模式的 Bearer Token 鉴权
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
