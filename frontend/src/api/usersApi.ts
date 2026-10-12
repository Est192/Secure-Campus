import { apiClient } from "./axios";
import type { UpdateUserProfileRequest, User } from "../types/User";

export interface Resource<T> {
  data: T;
}

export const usersApi = {
  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<Resource<User>>(`/users/${id}`);
    return data.data;
  },
  async update(id: number, profile: UpdateUserProfileRequest): Promise<User> {
    const { data } = await apiClient.patch<Resource<User>>(`/users/${id}`, profile);
    return data.data;
  },
};
