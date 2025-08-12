import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { BidResponse } from 'src/app/core/models/bids';
import { BidService } from 'src/app/core/services/bids.service';

interface Bid {
    id: number;
    auction_id: number;
    developer_id: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    auction: Auction;
    developer: Developer;
}

interface Auction {
    id: number;
    project_id: number;
    company_id: number;
    bidding_started_at: string;
    bidding_deadline: string;
    status: number;
    project?: Project;
}

interface Project {
    id: number;
    project_name: string;
    description: string;
    budget: number;
    company_id: number;
}

interface Developer {
    id: number;
    bio: string;
    user_id: number;
    linkedin: string;
    occupation: string;
    portfolio: string;
    user: UserRelations;
}

interface UserRelations {
    role_id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    image: string;
    role: UserRoleRelations;
}

interface UserRoleRelations {
    role_name: string;
}

@Component({
  selector: 'app-history-bids',
  templateUrl: './history-bids.component.html',
  styleUrl: './history-bids.component.scss'
})
export class HistoryBidsComponent {
@ViewChild('dt') dt: Table | undefined;
  
  auctionId: number = 0;
  bids: Bid[] = [];
  filteredBids: Bid[] = [];
  loading: boolean = true;
  
  // Para filtros
  searchTerm: string = '';
  selectedStatus: number | null = null;
  statusOptions = [
    { label: 'Pendiente', value: 0 },
    { label: 'Ganador', value: 1 },
    { label: 'Perdedor', value: 2 }
  ];

  constructor(
    private route: ActivatedRoute,
    private bidService: BidService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.auctionId = +params['id'];
      this.loadBids();
    });
  }

  loadBids(): void {
    this.loading = true;
    this.bidService.listBidsByAuction(this.auctionId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.bids = Array.isArray(response.data) ? response.data : [response.data];
          this.filteredBids = [...this.bids];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterBids(): void {
    if (this.selectedStatus === null) {
      this.filteredBids = [...this.bids];
    } else {
      this.filteredBids = this.bids.filter((bid: any) => bid.status === this.selectedStatus);
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  getStatusLabel(status: any): any {
    const statusMap: Record<any, any> = {
      0: 'Pendiente',
      1: 'Ganador',
      2: 'Perdedor'
    };
    return statusMap[status] || 'Desconocido';
  }

  getStatusSeverity(status: any): any {
    const severityMap: Record<any, any> = {
      0: 'warning',
      1: 'success',
      2: 'danger'
    };
    return severityMap[status] || '';
  }
}
