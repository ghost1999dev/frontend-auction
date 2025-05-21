export interface ApplicationResponse {
  message: string;
  applications: Application[];
}

export interface SingleApplicationResponse {
  status: boolean;
  message: string;
  application: Application;
}

export interface Application {
  id: number;
  project_id: number;
  developer_id: number;
  status: number; // 0=pending, 1=accepted, 2=rejected
  createdAt?: string;
  updatedAt?: string;
  project?: ProjectDetails;
  developer?: DeveloperDetails;
}

export interface ProjectDetails {
  id: number;
  project_name: string;
  description: string;
  company_profile?: CompanyProfile;
  category?: Category;
}

export interface DeveloperDetails {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface CompanyProfile {
  id: number;
  user?: UserDetails;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CreateApplicationRequest {
  project_id: number;
  developer_id: number;
}

export interface UpdateApplicationRequest {
  status: number; // 0=pending, 1=accepted, 2=rejected
}

export interface ApplicationsCounterResponse {
  status: number;
  message: string;
  applications: number;
}