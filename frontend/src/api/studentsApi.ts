import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type { CreateStudentRequest, User } from "../types/User";

export const studentsApi = {
  async list(params: ListQuery): Promise<Paginated<User>> {
    const { data } = await apiClient.get<Paginated<User>>("/students", { params });
    return data;
  },
  async create(student: CreateStudentRequest): Promise<User> {
    const { data } = await apiClient.post<{ data: User }>("/students", student);
    return data.data;
  },
};
