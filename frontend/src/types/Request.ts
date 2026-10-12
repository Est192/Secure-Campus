export type RequestStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export interface CampusRequest {
  id: number;
  user_id: number;
  type: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequest {
  type: string;
  title: string;
  description?: string | null;
}

export type UpdateRequest = Partial<CreateRequest>;

export interface TransitionRequestStatus {
  status: Exclude<RequestStatus, "Pending">;
  review_notes?: string | null;
}
