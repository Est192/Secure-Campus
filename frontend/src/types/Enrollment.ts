export type EnrollmentStatus = "active" | "withdrawn" | "completed";

export interface Enrollment {
  id: number;
  student_id: number;
  academic_group_id: number;
  status: EnrollmentStatus;
  enrolled_at: string | null;
  created_at: string;
  updated_at: string;
}