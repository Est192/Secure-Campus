export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}