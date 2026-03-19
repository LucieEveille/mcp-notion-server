/**
 * MCP server setup and request handling
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionClientWrapper } from "../client/index.js";
import { filterTools } from "../utils/index.js";
import * as schemas from "../types/schemas.js";
import * as args from "../types/args.js";
import http from "http";

/**
 * Create and configure the MCP server (shared between stdio and HTTP)
 */
function createServer(
  notionToken: string,
  enabledToolsSet: Set<string>,
  enableMarkdownConversion: boolean
) {
  const server = new Server(
    {
      name: "Notion MCP Server",
      version: "1.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const notionClient = new NotionClientWrapper(notionToken);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        let response;

        switch (request.params.name) {
          case "notion_append_block_children": {
            const args = request.params
              .arguments as unknown as args.AppendBlockChildrenArgs;
            if (!args.block_id || !args.children) {
              throw new Error(
                "Missing required arguments: block_id and children"
              );
            }
            response = await notionClient.appendBlockChildren(
              args.block_id,
              args.children
            );
            break;
          }

          case "notion_retrieve_block": {
            const args = request.params
              .arguments as unknown as args.RetrieveBlockArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveBlock(args.block_id);
            break;
          }

          case "notion_retrieve_block_children": {
            const args = request.params
              .arguments as unknown as args.RetrieveBlockChildrenArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveBlockChildren(
              args.block_id,
              args.start_cursor,
              args.page_size
            );
            break;
          }

          case "notion_delete_block": {
            const args = request.params
              .arguments as unknown as args.DeleteBlockArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.deleteBlock(args.block_id);
            break;
          }

          case "notion_update_block": {
            const args = request.params
              .arguments as unknown as args.UpdateBlockArgs;
            if (!args.block_id || !args.block) {
              throw new Error("Missing required arguments: block_id and block");
            }
            response = await notionClient.updateBlock(
              args.block_id,
              args.block
            );
            break;
          }

          case "notion_retrieve_page": {
            const args = request.params
              .arguments as unknown as args.RetrievePageArgs;
            if (!args.page_id) {
              throw new Error("Missing required argument: page_id");
            }
            response = await notionClient.retrievePage(args.page_id);
            break;
          }

          case "notion_update_page_properties": {
            const args = request.params
              .arguments as unknown as args.UpdatePagePropertiesArgs;
            if (!args.page_id || !args.properties) {
              throw new Error(
                "Missing required arguments: page_id and properties"
              );
            }
            response = await notionClient.updatePageProperties(
              args.page_id,
              args.properties
            );
            break;
          }

          case "notion_create_page": {
            const a = request.params
              .arguments as unknown as args.CreatePageArgs;
            if (!a.parent_id || !a.title) {
              throw new Error(
                "Missing required arguments: parent_id and title"
              );
            }
            response = await notionClient.createPage(
              a.parent_id,
              a.parent_type || "page_id",
              a.title,
              a.children,
              a.properties,
              a.icon
            );
            break;
          }

          case "notion_list_all_users": {
            const args = request.params
              .arguments as unknown as args.ListAllUsersArgs;
            response = await notionClient.listAllUsers(
              args.start_cursor,
              args.page_size
            );
            break;
          }

          case "notion_retrieve_user": {
            const args = request.params
              .arguments as unknown as args.RetrieveUserArgs;
            if (!args.user_id) {
              throw new Error("Missing required argument: user_id");
            }
            response = await notionClient.retrieveUser(args.user_id);
            break;
          }

          case "notion_retrieve_bot_user": {
            response = await notionClient.retrieveBotUser();
            break;
          }

          case "notion_query_database": {
            const args = request.params
              .arguments as unknown as args.QueryDatabaseArgs;
            if (!args.database_id) {
              throw new Error("Missing required argument: database_id");
            }
            response = await notionClient.queryDatabase(
              args.database_id,
              args.filter,
              args.sorts,
              args.start_cursor,
              args.page_size
            );
            break;
          }

          case "notion_create_database": {
            const args = request.params
              .arguments as unknown as args.CreateDatabaseArgs;
            response = await notionClient.createDatabase(
              args.parent,
              args.properties,
              args.title
            );
            break;
          }

          case "notion_retrieve_database": {
            const args = request.params
              .arguments as unknown as args.RetrieveDatabaseArgs;
            response = await notionClient.retrieveDatabase(args.database_id);
            break;
          }

          case "notion_update_database": {
            const args = request.params
              .arguments as unknown as args.UpdateDatabaseArgs;
            response = await notionClient.updateDatabase(
              args.database_id,
              args.title,
              args.description,
              args.properties
            );
            break;
          }

          case "notion_create_database_item": {
            const args = request.params
              .arguments as unknown as args.CreateDatabaseItemArgs;
            response = await notionClient.createDatabaseItem(
              args.database_id,
              args.properties
            );
            break;
          }

          case "notion_create_comment": {
            const args = request.params
              .arguments as unknown as args.CreateCommentArgs;

            if (!args.parent && !args.discussion_id) {
              throw new Error(
                "Either parent.page_id or discussion_id must be provided"
              );
            }

            response = await notionClient.createComment(
              args.parent,
              args.discussion_id,
              args.rich_text
            );
            break;
          }

          case "notion_retrieve_comments": {
            const args = request.params
              .arguments as unknown as args.RetrieveCommentsArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveComments(
              args.block_id,
              args.start_cursor,
              args.page_size
            );
            break;
          }

          case "notion_search": {
            const args = request.params.arguments as unknown as args.SearchArgs;
            response = await notionClient.search(
              args.query,
              args.filter,
              args.sort,
              args.start_cursor,
              args.page_size
            );
            break;
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }

        // Check format parameter and return appropriate response
        const requestedFormat =
          (request.params.arguments as any)?.format || "markdown";

        if (enableMarkdownConversion && requestedFormat === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        } else {
          return {
            content: [
              { type: "text", text: JSON.stringify(response, null, 2) },
            ],
          };
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const allTools = [
      schemas.appendBlockChildrenTool,
      schemas.retrieveBlockTool,
      schemas.retrieveBlockChildrenTool,
      schemas.deleteBlockTool,
      schemas.updateBlockTool,
      schemas.retrievePageTool,
      schemas.updatePagePropertiesTool,
      schemas.createPageTool,
      schemas.listAllUsersTool,
      schemas.retrieveUserTool,
      schemas.retrieveBotUserTool,
      schemas.createDatabaseTool,
      schemas.queryDatabaseTool,
      schemas.retrieveDatabaseTool,
      schemas.updateDatabaseTool,
      schemas.createDatabaseItemTool,
      schemas.createCommentTool,
      schemas.retrieveCommentsTool,
      schemas.searchTool,
    ];
    return {
      tools: filterTools(allTools, enabledToolsSet),
    };
  });

  return server;
}

/**
 * Start the MCP server (stdio or HTTP based on transport arg)
 */
export async function startServer(
  notionToken: string,
  enabledToolsSet: Set<string>,
  enableMarkdownConversion: boolean,
  transportType: "stdio" | "http" = "stdio",
  httpPort: number = 3000,
  authToken?: string
) {
  if (transportType === "http") {
    // Streamable HTTP transport for remote access
    const server = createServer(notionToken, enabledToolsSet, enableMarkdownConversion);

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || "/", `http://localhost:${httpPort}`);

      // Health check — no auth required
      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: enabledToolsSet.size || "all" }));
        return;
      }

      // Auth check (only for /mcp and other endpoints)
      if (authToken) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${authToken}`) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "未授权" }));
          return;
        }
      }

      if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // stateless
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } else {
        res.writeHead(404);
        res.end("Not found. Use /mcp for MCP endpoint or /health for status.");
      }
    });

    httpServer.listen(httpPort, "0.0.0.0", () => {
      console.error(`🚀 Notion MCP Server (HTTP) listening on port ${httpPort}`);
      console.error(`📡 MCP endpoint: http://0.0.0.0:${httpPort}/mcp`);
      console.error(`🔧 Enabled tools: ${enabledToolsSet.size || "all"}`);
      console.error(`📝 Markdown conversion: ${enableMarkdownConversion}`);
    });
  } else {
    // Classic stdio transport for local use
    const server = createServer(notionToken, enabledToolsSet, enableMarkdownConversion);
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}
