export interface Bid {
  id: number;
  auction_id: number;
  developer_id: number;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BidCreate {
  auction_id: number;
  developer_id: number;
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