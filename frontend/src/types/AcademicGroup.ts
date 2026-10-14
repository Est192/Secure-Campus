export interface AcademicGroup {
  id: number;
  name: string;
  degree_program_id: number;
  teacher_id: number | null;
  academic_year: string;
  semester: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicGroupListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  degree_program_id?: number;
}

export interface AcademicGroupInput {
  name: string;
  degree_program_id: number;
  teacher_id?: number | null;
  academic_year: string;
  semester: string;
}