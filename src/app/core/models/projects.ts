export interface ProjectResponse {
    message: string;
    projects: Project[];
  }
  
  export interface ProjectResponseById {
    message: string;
    project: Project;
  }
  
  export interface Project {
    id: number;
    company_id: number;
    category_id: number;
    project_name: string;
    description: string;
    budget: number;
    days_available: number;
    status: number; // 1 for active, 0 for inactive
    createdAt?: string;
    updatedAt?: string;
    category?: Category;
    company?: Company;
  }
  
  export interface Category {
    id: number;
    name: string;
    // Add other category properties if needed
  }
  
  export interface Company {
    id: number;
    name: string;
    // Add other company properties if needed
  }
  
  export interface CreateProject {
    company_id: number;
    category_id: number;
    project_name: string;
    description: string;
    budget?: number;
    days_available?: number;
    status?: number; // Optional as it has default value in backend
  }
  
  export interface UpdateProject {
    company_id?: number;
    category_id?: number;
    project_name?: string;
    description?: string;
    budget?: number;
    days_available?: number;
    status?: number;
  }
  
  export interface ProjectFilter {
    status?: number;
  }