export interface AuctionResponse {
    message: string;
    auctions: Auction[];
    data: Auction[]
}

export interface AuctionResponseById {
    status: boolean;
    message: string;
    auction: Auction;
    data: Auction
}

export interface Auction {
    id: number;
    project_id: number;
    bidding_started_at: string;
    bidding_deadline: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
    project?: {
        project_name: string;
        description: string;
        budget: number;
    };
}

export interface CreateAuction {
    project_id: number;
    bidding_started_at: string;
    bidding_deadline: string;
}

export interface UpdateAuction {
    project_id?: number;
    bidding_started_at?: string;
    bidding_deadline?: string;
    status?: number;
}

export enum AuctionStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3
}
