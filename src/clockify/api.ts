import type { ClockifyClient } from './client.js';
import type {
  Client,
  CreateTimeEntryBody,
  Project,
  StopTimerBody,
  Tag,
  TimeEntry,
  UpdateTimeEntryBody,
  User,
  Workspace,
} from './types.js';

export interface ListParams {
  name?: string;
  page?: number;
  pageSize?: number;
  archived?: boolean;
}

export interface TimeEntryParams {
  start?: string;
  end?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
  return `?${qs}`;
}

export function getWorkspaces(client: ClockifyClient): Promise<Workspace[]> {
  return client.get<Workspace[]>('/workspaces');
}

export function getCurrentUser(client: ClockifyClient): Promise<User> {
  return client.get<User>('/user');
}

export function getProjects(
  client: ClockifyClient,
  wsId: string,
  params?: ListParams,
): Promise<Project[]> {
  const query = buildQuery({
    name: params?.name,
    page: params?.page ?? 1,
    'page-size': params?.pageSize ?? 50,
    archived: params?.archived,
  });
  return client.get<Project[]>(`/workspaces/${wsId}/projects${query}`);
}

export function getClients(
  client: ClockifyClient,
  wsId: string,
  params?: ListParams,
): Promise<Client[]> {
  const query = buildQuery({
    name: params?.name,
    page: params?.page ?? 1,
    'page-size': params?.pageSize ?? 50,
    archived: params?.archived,
  });
  return client.get<Client[]>(`/workspaces/${wsId}/clients${query}`);
}

export function getTags(
  client: ClockifyClient,
  wsId: string,
  params?: ListParams,
): Promise<Tag[]> {
  const query = buildQuery({
    name: params?.name,
    page: params?.page ?? 1,
    'page-size': params?.pageSize ?? 50,
    archived: params?.archived,
  });
  return client.get<Tag[]>(`/workspaces/${wsId}/tags${query}`);
}

export function getTimeEntries(
  client: ClockifyClient,
  wsId: string,
  userId: string,
  params?: TimeEntryParams,
): Promise<TimeEntry[]> {
  const query = buildQuery({
    start: params?.start,
    end: params?.end,
    page: params?.page ?? 1,
    'page-size': params?.pageSize ?? 50,
  });
  return client.get<TimeEntry[]>(`/workspaces/${wsId}/user/${userId}/time-entries${query}`);
}

export async function getCurrentTimer(
  client: ClockifyClient,
  wsId: string,
  userId: string,
): Promise<TimeEntry | null> {
  const entries = await client.get<TimeEntry[]>(
    `/workspaces/${wsId}/user/${userId}/time-entries?in-progress=1&page-size=1`,
  );
  return entries.length > 0 ? entries[0] : null;
}

export function createTimeEntry(
  client: ClockifyClient,
  wsId: string,
  body: CreateTimeEntryBody,
): Promise<TimeEntry> {
  return client.post<TimeEntry>(`/workspaces/${wsId}/time-entries`, body);
}

export function stopTimer(
  client: ClockifyClient,
  wsId: string,
  userId: string,
  body: StopTimerBody,
): Promise<TimeEntry> {
  return client.patch<TimeEntry>(`/workspaces/${wsId}/user/${userId}/time-entries`, body);
}

export function updateTimeEntry(
  client: ClockifyClient,
  wsId: string,
  entryId: string,
  body: UpdateTimeEntryBody,
): Promise<TimeEntry> {
  return client.put<TimeEntry>(`/workspaces/${wsId}/time-entries/${entryId}`, body);
}

export function deleteTimeEntry(
  client: ClockifyClient,
  wsId: string,
  entryId: string,
): Promise<void> {
  return client.delete<void>(`/workspaces/${wsId}/time-entries/${entryId}`);
}
