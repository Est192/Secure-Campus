export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role_id: number | null;
  status: "active" | "inactive" | "suspended";
  degree_program_id: number | null;
  academic_group_id: number | null;
  student_number: string | null;
  employee_number: string | null;
  phone: string | null;
  role?: Role | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  degree_program_id?: number | null;
}
