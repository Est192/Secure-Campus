export interface Grade {
  id: number;
  enrollment_id: number;
  subject_id: number;
  first_partial: string | null;
  second_partial: string | null;
  third_partial: string | null;
  final_grade: string | null;
  average_grade: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradeListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  student_id?: number;
  academic_group_id?: number;
  subject_id?: number;
}

export interface GradeInput {
  enrollment_id?: number;
  subject_id?: number;
  first_partial?: string | null;
  second_partial?: string | null;
  third_partial?: string | null;
  final_grade?: string | null;
}