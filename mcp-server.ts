#!/usr/bin/env tsx
import { MCPServer } from "./src/endpoints/mcp.js";

const server = new MCPServer();
server.start().catch(console.error);
