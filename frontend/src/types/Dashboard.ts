import type { AcademicGroup } from "./AcademicGroup";
import type { DegreeProgram } from "./DegreeProgram";

export interface DashboardOverview {
  academicGroups: AcademicGroup[];
  academicGroupCount: number;
  degreePrograms: DegreeProgram[];
  pendingRequests: number;
  documentCount: number;
}

export interface DashboardStat {
  id: string;
  titleKey: string;
  value: string;
  icon: "attendance" | "courses" | "requests" | "documents";
  available: boolean;
}
