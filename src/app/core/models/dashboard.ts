export interface ActiveCompaniesResponse {
  companiesCount: number;
  message: string;
  status: number;
}

export interface ActiveDevelopersResponse {
  developersCount: number;
  message: string;
  status: number;
}

export interface ProjectsByStatusResponse {
  statusCounts: {
    Pendiente: number;
    Activo: number;
    Inactivo: number;
    Rechazado: number;
    Finalizado: number;
    [key: string]: number;
  };
  message: string;
  status: number;
}

export interface ReportsByStatusResponse {
  statusCounts: {
    Pendiente: number;
    Resuelto: number;
    Rechazado: number;
    [key: string]: number;
  };
  message: string;
  status: number;
}

export interface TotalCategoriesResponse {
  total: number;
  message: string;
  status: number;
}

export interface AdminsByStatusResponse {
  statusCounts: {
    active: number;
    inactive: number;
    [key: string]: number;
  };
  message: string;
  status: number;
}

export interface RatingDistributionItem {
  score: number;
  count: number;
}

export interface RatingsDistributionResponse extends Array<RatingDistributionItem> {}

// Añadir estas nuevas interfaces al archivo dashboard.ts
export interface TotalApplicationsResponse {
  total: number;
}

export interface TotalFavoritesResponse {
  total: number;
}

export interface MyRatingsDistributionResponse {
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface MyAverageRatingResponse {
  average: number;
}

export interface MyProjectsByStatusResponse {
  Pendiente: number;
  Activo: number;
  Inactivo: number;
  Rechazado: number;
  Finalizado: number;
}

export interface ProjectWithApplicants {
  project_id: number;
  project_name: string;
  budget: number;
  days_available: number;
  total_applicants: number;
}

export interface MyProjectsWithApplicantsResponse {
  success: boolean;
  message: string;
  data: ProjectWithApplicants[];
}