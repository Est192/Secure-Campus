import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type {
  CampusRequest,
  CreateRequest,
  TransitionRequestStatus,
  UpdateRequest,
} from "../types/Request";

export const requestsApi = {
  async list(params: ListQuery): Promise<Paginated<CampusRequest>> {
    const { data } = await apiClient.get<Paginated<CampusRequest>>("/requests", { params });
    return data;
  },
  async create(request: CreateRequest): Promise<CampusRequest> {
    const { data } = await apiClient.post<{ data: CampusRequest }>("/requests", request);
    return data.data;
  },
  async getById(id: number): Promise<CampusRequest> {
    const { data } = await apiClient.get<{ data: CampusRequest }>(`/requests/${id}`);
    return data.data;
  },
  async update(id: number, request: UpdateRequest): Promise<CampusRequest> {
    const { data } = await apiClient.patch<{ data: CampusRequest }>(`/requests/${id}`, request);
    return data.data;
  },
  async transition(id: number, input: TransitionRequestStatus): Promise<CampusRequest> {
    const { data } = await apiClient.patch<{ data: CampusRequest }>(`/requests/${id}/status`, input);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },
};
