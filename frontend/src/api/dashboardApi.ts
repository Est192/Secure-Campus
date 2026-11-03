import { academicGroupsApi } from "./academicGroupsApi";
import { degreeProgramsApi } from "./degreeProgramsApi";
import { documentsApi } from "./documentsApi";
import { requestsApi } from "./requestsApi";
import type { DashboardOverview } from "../types/Dashboard";

export const dashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    const [groups, programs, pendingRequests, documents] = await Promise.all([
      academicGroupsApi.list({ page: 1, per_page: 5 }),
      degreeProgramsApi.list(),
      requestsApi.list({ page: 1, per_page: 1, status: "Pending" }),
      documentsApi.list({ page: 1, per_page: 1 }),
    ]);

    return {
      academicGroups: groups.data,
      academicGroupCount: groups.meta.total,
      degreePrograms: programs,
      pendingRequests: pendingRequests.meta.total,
      documentCount: documents.meta.total,
    };
  },
};
