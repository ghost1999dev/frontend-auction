export interface ReportResponse {
    message: string;
    reports: Report[];
    total?: number;
    page?: number;
    totalPages?: number;
}

export interface ReportResponseById {
    status: boolean;
    message: string;
    report: Report;
}

export interface Report {
    id: number;
    reporter_id: number;
    user_id: number;
    user_role: string;
    project_id?: number;
    reason: string;
    comment?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    reporter_name?: string;
    reporter_email?: string;
    reportedUser_name?: string;
    reportedUser_email?: string;
    project_name?: string;
    admin_response?: string;
}

export interface CreateReportRequest {
    user_id?: number;
    project_id?: number;
    reason: string;
    comment?: string;
}

export interface UpdateReportRequest {
    reason?: string;
    comment?: string;
    user_role?: string;
}

export interface FilterReportsParams {
    status?: string;
    user_role?: string;
    page?: number;
    limit?: number;
}