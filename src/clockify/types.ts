export interface Workspace {
  id: string;
  name: string;
  hourlyRate?: { amount: number; currency: string };
  memberships?: Membership[];
  workspaceSettings?: Record<string, unknown>;
  imageUrl?: string;
  featureSubscriptionType?: string;
}

export interface Membership {
  hourlyRate?: { amount: number; currency: string };
  membershipStatus: string;
  membershipType: string;
  targetId: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  memberships?: Membership[];
  profilePicture?: string;
  activeWorkspace?: string;
  defaultWorkspace?: string;
  settings?: Record<string, unknown>;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  clientId?: string;
  clientName?: string;
  color?: string;
  archived: boolean;
  billable?: boolean;
  duration?: string;
  estimate?: { estimate: string; type: string };
  hourlyRate?: { amount: number; currency: string };
  memberships?: Membership[];
  note?: string;
  public?: boolean;
  template?: boolean;
  timeEstimate?: Record<string, unknown>;
}

export interface Client {
  id: string;
  name: string;
  workspaceId: string;
  archived: boolean;
  address?: string;
  email?: string;
  note?: string;
}

export interface Tag {
  id: string;
  name: string;
  workspaceId: string;
  archived: boolean;
}

export interface Task {
  id: string;
  name: string;
  projectId: string;
  workspaceId: string;
  assigneeIds?: string[];
  estimate?: string;
  status?: string;
  duration?: string;
  billable?: boolean;
  hourlyRate?: { amount: number; currency: string };
  budgetEstimate?: number;
}

export interface TimeInterval {
  start: string;
  end?: string | null;
  duration?: string | null;
}

export interface TimeEntry {
  id: string;
  description?: string;
  tagIds?: string[];
  userId: string;
  billable: boolean;
  taskId?: string | null;
  projectId?: string | null;
  workspaceId: string;
  timeInterval: TimeInterval;
  isLocked?: boolean;
  customFieldValues?: unknown[];
}

export interface CreateTimeEntryBody {
  start: string;
  end?: string;
  description?: string;
  projectId?: string;
  taskId?: string;
  tagIds?: string[];
  billable?: boolean;
}

export interface UpdateTimeEntryBody {
  start: string;
  end?: string;
  description?: string;
  projectId?: string;
  taskId?: string;
  tagIds?: string[];
  billable?: boolean;
}

export interface StopTimerBody {
  end: string;
}

export type ApprovalPeriod = 'WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';

export interface SubmitApprovalBody {
  startTime: string;
  period: ApprovalPeriod;
}

export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  dateRange?: { start: string; end: string };
  owner?: { userId: string; userName: string; timeZone: string; startOfWeek: string };
  status?: { state: string; updatedBy: string; updatedAt: string; note: string };
  creator?: { userId: string; userName: string; userEmail: string };
  approvalStatuses?: Record<string, string>;
}
