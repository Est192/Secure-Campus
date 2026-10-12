import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type { CreateTeacherRequest, User } from "../types/User";

export const teachersApi = {
  async list(params: ListQuery): Promise<Paginated<User>> {
    const { data } = await apiClient.get<Paginated<User>>("/teachers", { params });
    return data;
  },
  async create(teacher: CreateTeacherRequest): Promise<User> {
    const { data } = await apiClient.post<{ data: User }>("/teachers", teacher);
    return data.data;
  },
};
