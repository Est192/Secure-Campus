import { apiClient } from "./axios";
import type { Paginated } from "../types/Pagination";
import type { CampusDocument, UploadDocumentRequest } from "../types/Document";

export const documentsApi = {
  async list(params: { page?: number; per_page?: number }): Promise<Paginated<CampusDocument>> {
    const { data } = await apiClient.get<Paginated<CampusDocument>>("/documents", { params });
    return data;
  },
  async getById(id: number): Promise<CampusDocument> {
    const { data } = await apiClient.get<{ data: CampusDocument }>(`/documents/${id}`);
    return data.data;
  },
  async upload(
    document: UploadDocumentRequest,
    onProgress: (progress: number) => void,
  ): Promise<CampusDocument> {
    const form = new FormData();
    form.append("title", document.title);
    if (document.category) form.append("category", document.category);
    form.append("file", document.file);
    const { data } = await apiClient.post<{ data: CampusDocument }>("/documents", form, {
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return data.data;
  },
  async download(id: number): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(`/documents/${id}/download`, {
      responseType: "blob",
    });
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};
