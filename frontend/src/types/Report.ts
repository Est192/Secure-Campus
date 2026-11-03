import type { AcademicGroup } from "./AcademicGroup";
import type { DegreeProgram } from "./DegreeProgram";
import type { Enrollment } from "./Enrollment";
import type { Grade } from "./Grade";
import type { Subject } from "./Subject";
import type { User } from "./User";

export interface ReportListQuery {
  page?: number;
  per_page?: number;
}

export interface GradeReportQuery extends ReportListQuery {
  academic_group_id?: number;
}

export interface StudentReport extends User {
  degree_program?: DegreeProgram | null;
  academic_group?: AcademicGroup | null;
}

export interface GradeReport extends Grade {
  enrollment?: (Enrollment & {
    student?: User | null;
    academic_group?: AcademicGroup | null;
  }) | null;
  subject?: Subject | null;
}

export interface AcademicGroupReport extends AcademicGroup {
  degree_program?: DegreeProgram | null;
  teacher?: User | null;
  enrollments_count?: number;
}
