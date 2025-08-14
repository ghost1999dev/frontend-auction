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

export interface WinnerSelection {
  auction_id: number;
  winner_bid: number;
}

export interface WinnerResponse {
  success: boolean;
  message: string;
  data?: {
    bid_id: number;
    auction_id: number;
    winner_id: number;
    bid_amount: number;
  };
}

export interface FinalizeAuctionResponse {
  success: boolean;
  message: string;
}

export interface AuctionStatus {
  PENDING: number;
  ACTIVE: number;
  CLOSED: number;
}

export interface BidStatus {
  PENDING: number;
  WINNER: number;
  LOSER: number;
}

// Agregar estas nuevas interfaces al archivo bids.ts

export interface WinnerHistory {
  id: number;
  bid_id: number;
  auction_id: number;
  winner_id: number;
  bid_amount: number;
  created_at: string;
  bid?: {
    id: number;
    amount: number;
    status: number;
    createdAt: string;
    developer_profile?: DeveloperProfile;
  };
  auction?: {
    id: number;
    status: number;
    bidding_started_at?: string;
    bidding_deadline?: string;
    project?: {
      id: number;
      project_name: string;
      description?: string;
      budget?: number;
    };
  };
  winner?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface WinnerHistoryResponse {
  success: boolean;
  data: WinnerHistory[];
}

export interface FinalizeAuctionRequest {
  auction_id: number;
}

export interface FinalizeAuctionRequest {
  auction_id: number;
}

export interface AuctionResultsQuery {
  auction_id: number;
}

export interface WinnerHistoryItem {
  id: number;
  bid_id: number;
  auction_id: number;
  winner_id: number;
  bid_amount: number;
  created_at: string;
  bid?: {
    id: number;
    amount: number;
    status: number;
    createdAt: string;
    developer_profile?: {
      id: number;
      user_id: number;
      user?: {
        id: number;
        name: string;
        email?: string;
      };
    };
  };
  auction?: {
    id: number;
    status: number;
    bidding_started_at?: string;
    bidding_deadline?: string;
    project?: {
      id: number;
      project_name: string;
      description?: string;
      budget?: number;
    };
  };
  winner?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface WinnerHistoryResponse {
  success: boolean;
  data: WinnerHistoryItem[];
}