import { apiClient } from "./axios";
import type { ListQuery, Paginated } from "../types/Pagination";
import type { Enrollment } from "../types/Enrollment";

export interface EnrollmentListQuery extends ListQuery {
  status?: Enrollment["status"];
  student_id?: number;
  academic_group_id?: number;
}

export const enrollmentsApi = {
  async list(params: EnrollmentListQuery): Promise<Paginated<Enrollment>> {
    const { data } = await apiClient.get<Paginated<Enrollment>>("/enrollments", { params });
    return data;
  },
};