export interface FavoriteProject {
    id: number;
    project_id: number;
    developer_id: number;
    createdAt: string;
    updatedAt: string;
    project?: ProjectDetails;
}

export interface ProjectDetails {
    id: number;
    project_name: string;
    description: string;
    status: number;
    company_profile?: {
        user?: {
            name: string;
            email: string;
            phone: string;
        }
    };
    category?: {
        name: string;
    };
}

export interface FavoriteProjectResponse {
    success: boolean;
    message: string;
    favoriteProjects: FavoriteProject[];
    status: number;
}

export interface CreateFavoriteProjectRequest {
    project_id: number;
    developer_id: number;
}

export interface CreateFavoriteProjectResponse {
    success: boolean;
    message: string;
    data: FavoriteProject;
    status: number;
}

export interface DeleteFavoriteProjectResponse {
    success: boolean;
    message: string;
    status: number;
}