export interface ProjectTracking {
  id: number;
  project_id: number;
  status: number;
  notes?: string;
  updated_at?: string;
  project?: ProjectDetails;
}

export interface ProjectDetails {
  id: number;
  project_name?: string;
  description?: string;
  budget?: number;
  company_id?: number;
}

export interface ProjectTrackingCreate {
  project_id: number;
  status: number;
  notes?: string;
}

export interface ProjectTrackingResponse {
  success: boolean;
  message: string;
  tracking?: ProjectTracking;
  history?: ProjectTracking[];
  current?: ProjectTracking;
}

export interface ProjectStatus {
  ASSIGNED: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  COMPLETED: number;
}