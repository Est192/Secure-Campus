import { apiClient } from "./axios";
import type { Paginated } from "../types/Pagination";
import type { AcademicGroup, AcademicGroupInput, AcademicGroupListQuery } from "../types/AcademicGroup";

export const academicGroupsApi = {
  async list(params: AcademicGroupListQuery): Promise<Paginated<AcademicGroup>> {
    const { data } = await apiClient.get<Paginated<AcademicGroup>>("/academic-groups", { params });
    return data;
  },
  async getById(id: number): Promise<AcademicGroup> {
    const { data } = await apiClient.get<{ data: AcademicGroup }>(`/academic-groups/${id}`);
    return data.data;
  },
  async create(input: AcademicGroupInput): Promise<AcademicGroup> {
    const { data } = await apiClient.post<{ data: AcademicGroup }>("/academic-groups", input);
    return data.data;
  },
  async update(id: number, input: AcademicGroupInput): Promise<AcademicGroup> {
    const { data } = await apiClient.patch<{ data: AcademicGroup }>(`/academic-groups/${id}`, input);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/academic-groups/${id}`);
  },
};