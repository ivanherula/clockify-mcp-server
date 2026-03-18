#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const apiKey = process.env['CLOCKIFY_API_KEY'];
if (!apiKey) {
  console.error('Error: CLOCKIFY_API_KEY environment variable is required');
  process.exit(1);
}

const defaultWorkspaceId = process.env['CLOCKIFY_WORKSPACE_ID'];

const server = createServer(apiKey, defaultWorkspaceId);
const transport = new StdioServerTransport();

await server.connect(transport);
