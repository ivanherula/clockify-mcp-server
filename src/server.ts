import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClockifyClient } from './clockify/client.js';
import * as api from './clockify/api.js';

function toolError(err: unknown): { content: [{ type: 'text'; text: string }] } {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: `Error: ${message}` }] };
}

function toolResult(data: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function createServer(apiKey: string, defaultWorkspaceId?: string): McpServer {
  const client = new ClockifyClient(apiKey);

  let cachedWorkspaceId: string | undefined = defaultWorkspaceId;
  let cachedUserId: string | undefined;

  async function resolveWorkspaceId(): Promise<string> {
    if (cachedWorkspaceId) return cachedWorkspaceId;
    const workspaces = await api.getWorkspaces(client);
    if (workspaces.length === 0) throw new Error('No workspaces found for this API key');
    cachedWorkspaceId = workspaces[0].id;
    return cachedWorkspaceId;
  }

  async function resolveUserId(): Promise<string> {
    if (cachedUserId) return cachedUserId;
    const user = await api.getCurrentUser(client);
    cachedUserId = user.id;
    return cachedUserId;
  }

  const server = new McpServer({
    name: 'clockify-mcp-server',
    version: '0.1.0',
  });

  server.tool('get_workspaces', 'List all Clockify workspaces', {}, async () => {
    try {
      const workspaces = await api.getWorkspaces(client);
      return toolResult(workspaces);
    } catch (err) {
      return toolError(err);
    }
  });

  server.tool('get_current_user', 'Get the authenticated Clockify user info', {}, async () => {
    try {
      const user = await api.getCurrentUser(client);
      return toolResult(user);
    } catch (err) {
      return toolError(err);
    }
  });

  server.tool(
    'get_projects',
    'List projects in the workspace',
    {
      name: z.string().optional().describe('Filter by project name'),
      clientId: z.string().optional().describe('Filter by client ID'),
      archived: z.boolean().optional().describe('Include archived projects'),
      page: z.number().int().min(1).default(1).describe('Page number'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Results per page'),
    },
    async ({ name, archived, page, pageSize }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const projects = await api.getProjects(client, wsId, { name, archived, page, pageSize });
        return toolResult(projects);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'get_clients',
    'List clients in the workspace',
    {
      name: z.string().optional().describe('Filter by client name'),
      archived: z.boolean().optional().describe('Include archived clients'),
      page: z.number().int().min(1).default(1).describe('Page number'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Results per page'),
    },
    async ({ name, archived, page, pageSize }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const clients = await api.getClients(client, wsId, { name, archived, page, pageSize });
        return toolResult(clients);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'get_tags',
    'List tags in the workspace',
    {
      name: z.string().optional().describe('Filter by tag name'),
      archived: z.boolean().optional().describe('Include archived tags'),
      page: z.number().int().min(1).default(1).describe('Page number'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Results per page'),
    },
    async ({ name, archived, page, pageSize }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const tags = await api.getTags(client, wsId, { name, archived, page, pageSize });
        return toolResult(tags);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'get_time_entries',
    'List time entries for the current user',
    {
      start: z.string().datetime().optional().describe('Start of date range (ISO 8601 UTC)'),
      end: z.string().datetime().optional().describe('End of date range (ISO 8601 UTC)'),
      page: z.number().int().min(1).default(1).describe('Page number'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Results per page'),
    },
    async ({ start, end, page, pageSize }) => {
      try {
        const [wsId, userId] = await Promise.all([resolveWorkspaceId(), resolveUserId()]);
        const entries = await api.getTimeEntries(client, wsId, userId, {
          start,
          end,
          page,
          pageSize,
        });
        return toolResult(entries);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'get_current_timer',
    'Get the currently running timer (null if no timer is running)',
    {},
    async () => {
      try {
        const [wsId, userId] = await Promise.all([resolveWorkspaceId(), resolveUserId()]);
        const entry = await api.getCurrentTimer(client, wsId, userId);
        return toolResult(entry);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'create_time_entry',
    'Create a time entry. Omit `end` to start a live timer.',
    {
      start: z.string().datetime().describe('Start time (ISO 8601 UTC)'),
      end: z.string().datetime().optional().describe('End time (ISO 8601 UTC). Omit to start a live timer.'),
      description: z.string().optional().describe('Entry description'),
      projectId: z.string().optional().describe('Project ID'),
      taskId: z.string().optional().describe('Task ID'),
      tagIds: z.array(z.string()).optional().describe('Tag IDs'),
      billable: z.boolean().optional().describe('Whether the entry is billable'),
    },
    async ({ start, end, description, projectId, taskId, tagIds, billable }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const entry = await api.createTimeEntry(client, wsId, {
          start,
          end,
          description,
          projectId,
          taskId,
          tagIds,
          billable,
        });
        return toolResult(entry);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'stop_timer',
    'Stop the currently running timer',
    {
      end: z.string().datetime().describe('End time (ISO 8601 UTC)'),
    },
    async ({ end }) => {
      try {
        const [wsId, userId] = await Promise.all([resolveWorkspaceId(), resolveUserId()]);
        const entry = await api.stopTimer(client, wsId, userId, { end });
        return toolResult(entry);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'update_time_entry',
    'Update (full replace) an existing time entry by ID',
    {
      entryId: z.string().describe('Time entry ID'),
      start: z.string().datetime().describe('Start time (ISO 8601 UTC)'),
      end: z.string().datetime().optional().describe('End time (ISO 8601 UTC)'),
      description: z.string().optional().describe('Entry description'),
      projectId: z.string().optional().describe('Project ID'),
      taskId: z.string().optional().describe('Task ID'),
      tagIds: z.array(z.string()).optional().describe('Tag IDs'),
      billable: z.boolean().optional().describe('Whether the entry is billable'),
    },
    async ({ entryId, start, end, description, projectId, taskId, tagIds, billable }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const entry = await api.updateTimeEntry(client, wsId, entryId, {
          start,
          end,
          description,
          projectId,
          taskId,
          tagIds,
          billable,
        });
        return toolResult(entry);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'delete_time_entry',
    'Delete a time entry by ID',
    {
      entryId: z.string().describe('Time entry ID'),
    },
    async ({ entryId }) => {
      try {
        const wsId = await resolveWorkspaceId();
        await api.deleteTimeEntry(client, wsId, entryId);
        return toolResult({ success: true, entryId });
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'submit_for_approval',
    'Submit time entries for manager approval for a given week/period',
    {
      startTime: z.string().datetime().describe('Start date of the period to submit (ISO 8601 UTC)'),
      period: z
        .enum(['WEEKLY', 'SEMI_MONTHLY', 'MONTHLY'])
        .describe('Period type'),
    },
    async ({ startTime, period }) => {
      try {
        const [wsId, userId] = await Promise.all([resolveWorkspaceId(), resolveUserId()]);
        const request = await api.submitForApproval(client, wsId, userId, { startTime, period });
        return toolResult(request);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    'get_tasks',
    'List tasks within a project',
    {
      projectId: z.string().describe('Project ID'),
      name: z.string().optional().describe('Filter by task name'),
      archived: z.boolean().optional().describe('Include archived tasks'),
      page: z.number().int().min(1).default(1).describe('Page number'),
      pageSize: z.number().int().min(1).max(200).default(50).describe('Results per page'),
    },
    async ({ projectId, name, archived, page, pageSize }) => {
      try {
        const wsId = await resolveWorkspaceId();
        const tasks = await api.getTasks(client, wsId, projectId, { name, archived, page, pageSize });
        return toolResult(tasks);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  return server;
}
