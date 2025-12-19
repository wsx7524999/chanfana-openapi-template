# Model Context Protocol (MCP) Integration

This project includes a Model Context Protocol (MCP) server that exposes the OpenAPI endpoints as tools that AI agents can use. This enables AI assistants like Claude, ChatGPT, and other AI agents to interact with your API programmatically.

## What is MCP?

Model Context Protocol (MCP) is an open protocol developed by Anthropic that standardizes how AI models connect with external tools, APIs, and data sources. Think of it as a universal adapter that allows AI agents to:

- Discover available tools and their capabilities
- Understand how to use those tools
- Execute operations through standardized interfaces
- Get structured responses back

## Available MCP Tools

The MCP server exposes the following tools that mirror the OpenAPI endpoints:

### 1. `list_tasks`
List all tasks from the database with pagination and search support.

**Parameters:**
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of results per page (default: 10)
- `search` (string, optional): Search query to filter tasks
- `orderBy` (string, optional): Order by field (default: 'id DESC')

**Example:**
```json
{
  "name": "list_tasks",
  "arguments": {
    "page": 1,
    "limit": 10,
    "search": "important"
  }
}
```

### 2. `create_task`
Create a new task in the database.

**Parameters:**
- `name` (string, required): Name of the task
- `slug` (string, required): URL-friendly slug
- `description` (string, required): Detailed description
- `completed` (boolean, required): Completion status
- `due_date` (string, required): Due date in ISO 8601 format

**Example:**
```json
{
  "name": "create_task",
  "arguments": {
    "name": "Complete documentation",
    "slug": "complete-docs",
    "description": "Finish writing the MCP integration docs",
    "completed": false,
    "due_date": "2024-12-31T23:59:59Z"
  }
}
```

### 3. `get_task`
Retrieve a specific task by ID.

**Parameters:**
- `id` (number, required): The task ID

### 4. `update_task`
Update an existing task.

**Parameters:**
- `id` (number, required): The task ID
- Other fields (optional): Any task fields to update

### 5. `delete_task`
Delete a task by ID.

**Parameters:**
- `id` (number, required): The task ID to delete

### 6. `dummy_endpoint`
Example endpoint demonstrating parameter handling.

**Parameters:**
- `slug` (string, required): URL slug
- `name` (string, required): Name parameter

## Setting Up the MCP Server

### Prerequisites

1. Node.js 18+ installed
2. All project dependencies installed (`npm install`)
3. Database set up (see main README.md)

### Running the MCP Server

The MCP server can be started using:

```bash
npm run mcp
```

This runs the server using stdio transport, which is the standard way MCP servers communicate with clients.

## Integrating with AI Clients

### Claude Desktop

To use this MCP server with Claude Desktop:

1. Locate your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this server configuration:

```json
{
  "mcpServers": {
    "chanfana-openapi-template": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-server.ts"],
      "description": "Chanfana OpenAPI Template MCP Server"
    }
  }
}
```

3. Restart Claude Desktop

4. The tools should now appear in Claude's interface

### Other MCP Clients

The MCP server follows the standard MCP protocol and should work with any MCP-compatible client:

- **Postman**: Use Postman's MCP support to test and debug
- **Custom integrations**: Build your own client using the `@modelcontextprotocol/sdk`
- **AI frameworks**: Integrate with LangChain, AutoGPT, or other agentic frameworks

## Configuration

The `mcp-config.json` file provides a template configuration that can be used as a reference or copied to your MCP client's configuration directory.

## Architecture

The MCP integration consists of:

1. **MCP Server** (`src/endpoints/mcp.ts`): Core server implementation
   - Tool definitions matching OpenAPI endpoints
   - Request handlers for each tool
   - Error handling and validation

2. **Entry Point** (`mcp-server.ts`): Standalone server launcher
   - Stdio transport for client communication
   - Process management

3. **Configuration** (`mcp-config.json`): Client configuration template

## Implementation Notes

### Current Template Design

The MCP server is implemented as a **template/demonstration** that shows how MCP tools work. The current tool handlers return instructional text that describes what API calls would be made, rather than making actual API calls. This design choice:

- Makes it easy to understand the MCP protocol without needing a live API deployment
- Allows testing the MCP integration independently
- Provides clear examples of how to implement real API calls

### Making Real API Calls (Production Use)

For production use, you should implement actual API calls in the tool handlers. Here are three approaches:

#### Option 1: HTTP Calls to Deployed API

Replace template responses with actual HTTP calls to your deployed Cloudflare Worker:

```typescript
case "list_tasks": {
  const params = new URLSearchParams();
  if (args?.page) params.append("page", String(args.page));
  if (args?.limit) params.append("limit", String(args.limit));
  
  const response = await fetch(`https://your-api.workers.dev/tasks?${params}`);
  const data = await response.json();
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify(data, null, 2)
    }]
  };
}
```

#### Option 2: Direct Database Access

For local development, connect directly to D1:

```typescript
import { D1Database } from '@cloudflare/workers-types';

// Configure D1 connection for local dev
const db = await getLocalD1Database();

case "list_tasks": {
  const results = await db.prepare(
    'SELECT * FROM tasks ORDER BY id DESC LIMIT ?'
  ).bind(args?.limit || 10).all();
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify(results, null, 2)
    }]
  };
}
```

#### Option 3: Shared Business Logic

Extract logic into shared services:

```typescript
// src/services/tasks.ts
export async function listTasks(db: D1Database, params: ListTasksParams) {
  // Shared implementation
}

// Use in both HTTP endpoints and MCP server
```

## Development

### Adding New Tools

To add new MCP tools:

1. Open `src/endpoints/mcp.ts`
2. Add tool definition in the `ListToolsRequestSchema` handler
3. Add tool implementation in the `CallToolRequestSchema` handler
4. Update this documentation

Example:

```typescript
// In ListToolsRequestSchema handler
{
  name: "my_new_tool",
  description: "Description of what this tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Parameter description"
      }
    },
    required: ["param1"]
  }
}

// In CallToolRequestSchema handler
case "my_new_tool": {
  const { param1 } = args;
  // Implementation
  return {
    content: [{
      type: "text",
      text: "Result of the operation"
    }]
  };
}
```

### Testing

Test the MCP server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npx tsx mcp-server.ts
```

This opens a web interface for testing tool calls and inspecting responses.

## Use Cases

### AI-Powered Task Management

Ask Claude to manage your tasks:
- "Create a task for finishing the quarterly report due next Friday"
- "List all incomplete tasks"
- "Update task #5 to mark it as completed"

### Automated Workflows

Build agentic workflows that:
- Create tasks based on emails or calendar events
- Generate reports from task data
- Send notifications for overdue tasks
- Integrate with other systems via MCP tools

### API Testing and Exploration

Use AI to:
- Explore API capabilities conversationally
- Generate test data
- Validate API responses
- Document API behavior

## Security Considerations

- The MCP server exposes all defined tools to connected clients
- Ensure proper authentication when deploying to production
- Consider rate limiting for tool calls
- Validate all inputs even though Zod schemas are defined
- Run the MCP server in a secure environment

## Troubleshooting

### Server won't start

- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (must be 18+)
- Verify TypeScript compilation: `npx tsc --noEmit`

### Tools not appearing in Claude

- Verify the path in `claude_desktop_config.json` is absolute
- Restart Claude Desktop completely
- Check Claude's developer console for errors
- Test server manually: `npm run mcp`

### Tool calls failing

- Check tool definitions match implementation
- Verify required parameters are provided
- Use MCP Inspector to test tools: `npx @modelcontextprotocol/inspector npx tsx mcp-server.ts`

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic MCP Guide](https://docs.anthropic.com/en/docs/model-context-protocol)
- [Chanfana Documentation](https://chanfana.com/)
- [OpenAPI Specification](https://swagger.io/specification/)

## Contributing

To improve the MCP integration:

1. Fork the repository
2. Create a feature branch
3. Make your changes to `src/endpoints/mcp.ts`
4. Test with MCP Inspector
5. Update documentation
6. Submit a pull request

## License

This MCP integration is part of the Chanfana OpenAPI Template and is licensed under the same terms as the main project.
