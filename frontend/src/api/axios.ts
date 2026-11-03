import axios from "axios";

export const AUTH_TOKEN_STORAGE_KEY = "securecampus-auth-token";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event("securecampus:unauthorized"));
    }
    return Promise.reject(error);
  },
);
