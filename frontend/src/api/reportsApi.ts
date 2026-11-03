import { apiClient } from "./axios";
import type { Paginated } from "../types/Pagination";
import type {
  AcademicGroupReport,
  GradeReport,
  GradeReportQuery,
  ReportListQuery,
  StudentReport,
} from "../types/Report";
import type { User } from "../types/User";

export const reportsApi = {
  async students(params: ReportListQuery): Promise<Paginated<StudentReport>> {
    const { data } = await apiClient.get<Paginated<StudentReport>>("/reports/students", { params });
    return data;
  },
  async teachers(params: ReportListQuery): Promise<Paginated<User>> {
    const { data } = await apiClient.get<Paginated<User>>("/reports/teachers", { params });
    return data;
  },
  async grades(params: GradeReportQuery): Promise<Paginated<GradeReport>> {
    const { data } = await apiClient.get<Paginated<GradeReport>>("/reports/grades", { params });
    return data;
  },
  async academicGroups(params: ReportListQuery): Promise<Paginated<AcademicGroupReport>> {
    const { data } = await apiClient.get<Paginated<AcademicGroupReport>>("/reports/academic-groups", { params });
    return data;
  },
};
