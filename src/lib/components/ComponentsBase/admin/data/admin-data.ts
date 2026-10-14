import {
  dummyAdminLogs,
  dummyAdminServiceStatuses,
  dummyAdminSummary,
  dummyAdminUsers
} from '$lib/db/dummy/panoptes_dummy_ui';

export type AdminTab = 'dashboard' | 'logs';

export type AdminSummary = {
  priorityUsers: number;
  capacity: number;
  regularUsers: number;
  todayRegistrations: number;
  priorityAcceptedUsers: number;
  freePlanUsers: number;
  miniPlanUsers: number;
  miniPlanRevenue: number;
};

export type AdminUserRow = {
  id: string;
  order: number;
  email: string;
  plan: string;
  createdAt: string;
  source: string;
  url: string;
  status: string;
};

export type AdminLogRow = {
  id: string;
  timestamp: string;
  label: string;
};

export type AdminServiceStatusRow = {
  id: string;
  label: string;
  state: string;
};

export const adminSummary: AdminSummary = dummyAdminSummary;
export const adminUsers: AdminUserRow[] = dummyAdminUsers;
export const adminLogs: AdminLogRow[] = dummyAdminLogs;
export const adminServiceStatuses: AdminServiceStatusRow[] = dummyAdminServiceStatuses;
