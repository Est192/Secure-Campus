import { apiClient } from "./axios";
import type { User } from "../types/User";

export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponse {
  data: User;
  token: string;
  token_type: "Bearer";
}

export interface LogoutResponse {
  message: string;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", credentials);
    return data;
  },

  async logout(): Promise<LogoutResponse> {
    const { data } = await apiClient.post<LogoutResponse>("/auth/logout");
    return data;
  },
};
