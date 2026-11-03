import { apiClient } from "./axios";
import type { Paginated } from "../types/Pagination";
import type { Grade, GradeInput, GradeListQuery } from "../types/Grade";

export const gradesApi = {
  async list(params: GradeListQuery): Promise<Paginated<Grade>> {
    const { data } = await apiClient.get<Paginated<Grade>>("/grades", { params });
    return data;
  },
  async getById(id: number): Promise<Grade> {
    const { data } = await apiClient.get<{ data: Grade }>(`/grades/${id}`);
    return data.data;
  },
  async create(input: GradeInput): Promise<Grade> {
    const { data } = await apiClient.post<{ data: Grade }>("/grades", input);
    return data.data;
  },
  async update(id: number, input: GradeInput): Promise<Grade> {
    const { data } = await apiClient.patch<{ data: Grade }>(`/grades/${id}`, input);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/grades/${id}`);
  },
};