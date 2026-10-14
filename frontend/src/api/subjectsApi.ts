import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type { Subject } from "../types/Subject";

export const subjectsApi = {
  async list(params: ListQuery): Promise<Paginated<Subject>> {
    const { data } = await apiClient.get<Paginated<Subject>>("/subjects", { params });
    return data;
  },
};