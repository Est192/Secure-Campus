export interface CampusDocument {
  id: number;
  user_id: number | null;
  title: string;
  category: string | null;
  disk: string;
  path: string;
  mime_type: string | null;
  size: number | null;
  metadata: { original_name?: string } | null;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentRequest {
  title: string;
  category?: string | null;
  file: File;
}
