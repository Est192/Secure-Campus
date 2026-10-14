import { apiClient } from "./axios";
import type { Paginated } from "../types/Pagination";
import type { Role } from "../types/Role";

export const rolesApi = {
  async list(): Promise<Role[]> {
    const { data } = await apiClient.get<Paginated<Role>>("/roles", {
      params: { per_page: 100 },
    });
    return data.data;
  },
};
