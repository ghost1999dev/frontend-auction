export interface Bid {
  id: number;
  auction_id: number;
  developer_id: number;
  amount: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  auction?: AuctionDetails;
  developer_profile?: DeveloperProfile;
}

export interface AuctionDetails {
  id: number;
  status: number;
  project_id: number;
  bidding_started_at?: string;
  bidding_deadline?: string;
  project?: ProjectDetails;
}

export interface ProjectDetails {
  id: number;
  project_name: string;
  description?: string;
  budget?: number;
  company_id?: number;
  company?: CompanyDetails;
}

export interface CompanyDetails {
  id: number;
  name: string;
  email?: string;
}

export interface DeveloperProfile {
  id: number;
  user_id: number;
  user?: UserDetails;
}

export interface UserDetails {
  id: number;
  name: string;
  email?: string;
}

export interface BidCreate {
  auction_id: number;
  user_id: number;
  amount: number;
}

export interface BidUpdate {
  amount: number;
}

export interface BidResponse {
  success: boolean;
  message: string;
  data: Bid | Bid[];
  count?: number;
}

export interface BidErrorResponse {
  success: boolean;
  message: string;
  error: string;
  details?: any;
}

export interface AuctionResults {
  id: number;
  auction_id: number;
  developer_id: number;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  developer_profile: DeveloperProfile;
}

export interface AuctionResultsResponse {
  success: boolean;
  count: number;
  data: AuctionResults[];
}