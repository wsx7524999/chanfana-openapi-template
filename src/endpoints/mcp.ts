import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

/**
 * MCP Server for the OpenAPI Template
 * This server exposes the API endpoints as MCP tools that can be used by AI agents
 */
export class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "chanfana-openapi-template",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_tasks",
            description:
              "List all tasks from the database. Supports pagination, search, and filtering.",
            inputSchema: {
              type: "object",
              properties: {
                page: {
                  type: "number",
                  description: "Page number for pagination (default: 1)",
                },
                limit: {
                  type: "number",
                  description: "Number of results per page (default: 10)",
                },
                search: {
                  type: "string",
                  description: "Search query to filter tasks by name, slug, or description",
                },
                orderBy: {
                  type: "string",
                  description: "Order by field (default: 'id DESC')",
                },
              },
            },
          },
          {
            name: "create_task",
            description: "Create a new task in the database",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the task",
                },
                slug: {
                  type: "string",
                  description: "URL-friendly slug for the task",
                },
                description: {
                  type: "string",
                  description: "Detailed description of the task",
                },
                completed: {
                  type: "boolean",
                  description: "Whether the task is completed (default: false)",
                },
                due_date: {
                  type: "string",
                  description: "Due date in ISO 8601 format (e.g., '2024-12-31T23:59:59Z')",
                },
              },
              required: ["name", "slug", "description", "completed", "due_date"],
            },
          },
          {
            name: "get_task",
            description: "Get a specific task by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  description: "The ID of the task to retrieve",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "update_task",
            description: "Update an existing task",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  description: "The ID of the task to update",
                },
                name: {
                  type: "string",
                  description: "Name of the task",
                },
                slug: {
                  type: "string",
                  description: "URL-friendly slug for the task",
                },
                description: {
                  type: "string",
                  description: "Detailed description of the task",
                },
                completed: {
                  type: "boolean",
                  description: "Whether the task is completed",
                },
                due_date: {
                  type: "string",
                  description: "Due date in ISO 8601 format",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "delete_task",
            description: "Delete a task by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  description: "The ID of the task to delete",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "dummy_endpoint",
            description: "Example endpoint that takes a slug and name parameter",
            inputSchema: {
              type: "object",
              properties: {
                slug: {
                  type: "string",
                  description: "URL slug parameter",
                },
                name: {
                  type: "string",
                  description: "Name parameter",
                },
              },
              required: ["slug", "name"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // NOTE: This is a template implementation that returns instructional responses.
      // For production use, replace these with actual API calls or database queries.
      // See docs/MCP_INTEGRATION.md for implementation examples.

      try {
        switch (name) {
          case "list_tasks": {
            // Template response - replace with: await fetch(`https://your-api/tasks?${params}`)
            // or direct database query for production use
            const params = new URLSearchParams();
            if (args?.page) params.append("page", String(args.page));
            if (args?.limit) params.append("limit", String(args.limit));
            if (args?.search) params.append("search", String(args.search));
            if (args?.orderBy) params.append("orderBy", String(args.orderBy));

            return {
              content: [
                {
                  type: "text",
                  text: `To list tasks, call: GET /tasks?${params.toString()}\n\nThis would return a paginated list of tasks matching the criteria.`,
                },
              ],
            };
          }

          case "create_task": {
            return {
              content: [
                {
                  type: "text",
                  text: `To create a task, call: POST /tasks\nBody: ${JSON.stringify(args, null, 2)}\n\nThis would create a new task with the provided details.`,
                },
              ],
            };
          }

          case "get_task": {
            if (!args?.id) {
              throw new McpError(ErrorCode.InvalidParams, "Task ID is required");
            }
            return {
              content: [
                {
                  type: "text",
                  text: `To get task #${args.id}, call: GET /tasks/${args.id}\n\nThis would return the full details of the task.`,
                },
              ],
            };
          }

          case "update_task": {
            if (!args?.id) {
              throw new McpError(ErrorCode.InvalidParams, "Task ID is required");
            }
            const { id, ...updateData } = args;
            return {
              content: [
                {
                  type: "text",
                  text: `To update task #${id}, call: PUT /tasks/${id}\nBody: ${JSON.stringify(updateData, null, 2)}\n\nThis would update the task with the new data.`,
                },
              ],
            };
          }

          case "delete_task": {
            if (!args?.id) {
              throw new McpError(ErrorCode.InvalidParams, "Task ID is required");
            }
            return {
              content: [
                {
                  type: "text",
                  text: `To delete task #${args.id}, call: DELETE /tasks/${args.id}\n\nThis would permanently delete the task.`,
                },
              ],
            };
          }

          case "dummy_endpoint": {
            if (!args?.slug || !args?.name) {
              throw new McpError(
                ErrorCode.InvalidParams,
                "Both slug and name are required"
              );
            }
            return {
              content: [
                {
                  type: "text",
                  text: `To call dummy endpoint, use: POST /dummy/${args.slug}\nBody: {"name": "${args.name}"}\n\nThis would return: "this is a dummy endpoint, serving as example"`,
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool: ${error}`
        );
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Log to stderr so it doesn't interfere with MCP protocol on stdout
    console.error("MCP Server running on stdio");
  }
}
