import { apiClient } from "./axios";
import type { DegreeProgram } from "../types/DegreeProgram";

interface Paginated<T> {
  data: T[];
}

export const degreeProgramsApi = {
  async list(): Promise<DegreeProgram[]> {
    const { data } = await apiClient.get<Paginated<DegreeProgram>>("/degree-programs", {
      params: { per_page: 100 },
    });
    return data.data;
  },
};
