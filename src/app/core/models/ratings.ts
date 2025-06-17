export interface RatingResponse {
    message: string;
    ratings: Rating[];
    total?: number;
    page?: number;
    totalPages?: number;
}

export interface RatingResponseById {
    status: boolean;
    message: string;
    rating: Rating;
}

export interface Rating {
    id: number;
    score: number;
    comment: string;
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
    developer_id: number;
    company_id: number;
    developer_name?: string;
    company_name?: string;
}

export interface RatingAverageResponse {
    developer_id?: number;
    company_id?: number;
    averageScore: number;
    totalRatings: number;
    type?: string;
}

export interface PublicProfileResponse {
    user: any;
    ratingSummary: {
        averageScore: number;
        totalRatings: number;
    };
    recentRatings: {
        score: number;
        comment: string;
        createdAt: string;
        reviewer: any;
    }[];
}

export interface CreateRatingRequest {
    developer_id?: number;
    company_id?: number;
    score: number;
    comment?: string;
    isVisible?: boolean;
}

export interface UpdateRatingRequest {
    score?: number;
    comment?: string;
    isVisible?: boolean;
}

export interface FilterRatingsParams {
    developer_id?: number;
    company_id?: number;
    score_min?: number;
    score_max?: number;
    score?: number;
    isVisible?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
}