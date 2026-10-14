import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type { CreateUserRequest, UpdateUserProfileRequest, User } from "../types/User";

export interface Resource<T> {
  data: T;
}

export const usersApi = {
  async list(params: ListQuery): Promise<Paginated<User>> {
    const { data } = await apiClient.get<Paginated<User>>("/users", { params });
    return data;
  },
  async create(user: CreateUserRequest): Promise<User> {
    const { data } = await apiClient.post<Resource<User>>("/users", user);
    return data.data;
  },
  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<Resource<User>>(`/users/${id}`);
    return data.data;
  },
  async update(id: number, profile: UpdateUserProfileRequest): Promise<User> {
    const { data } = await apiClient.patch<Resource<User>>(`/users/${id}`, profile);
    return data.data;
  },
};
