import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { UserService } from 'src/app/core/services/user.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { BidService } from 'src/app/core/services/bids.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

interface Bid {
    id: number;
    auction_id: number;
    developer_id: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    auction: Auction;
    developer_profile: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

interface Auction {
    id: number;
    project_id: number;
    status: number;
    bidding_started_at: string;
    bidding_deadline: string;
    project: Project;
}

interface Project {
    id: number;
    project_name: string;
    description: string;
    budget: number;
}

@Component({
  selector: 'app-bids',
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.scss']
})
export class BidsComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  
  // Datos del usuario
  developer: any = null;
  userId: number;
  
  // Datos de las Pujas
  bids: Bid[] = [];
  filteredBids: Bid[] = [];
  selectedBids: Bid[] = [];
  projects: Project[] = [];
  
  // Filtros
  selectedProject: Project | null = null;
  selectedStatus: number | null = null;
  statusOptions = [
    { label: 'Enviada', value: 0 },
    { label: 'Ganada', value: 1 },
    { label: 'Perdida', value: 2 },
  ];
  
  // Estados UI
  loading = false;
  searchTerm = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private developerService: DeveloperService,
    private bidService: BidService,
    private notificationService: NotificationService
  ) {
    this.userId = this.getUserIdFromToken();
  }

  ngOnInit(): void {
    this.loadDeveloperData();
  }

  private getUserIdFromToken(): number {
    const token = localStorage.getItem('login-token');
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || 0;
    } catch (e) {
      console.error('Error parsing token:', e);
      return 0;
    }
  }

  private loadDeveloperData(): void {
    this.loading = true;
    
    this.userService.getUsersById(this.userId.toString()).subscribe({
      next: (user: any) => {
        if (!user || user.role_id !== 2) {
          this.notificationService.showErrorCustom('Acceso solo para desarrolladores');
          this.router.navigate(['/main/auctions']);
          return;
        }

        this.developerService.getDeveloperByIdUser(user.id).subscribe({
          next: (developer) => {
            this.developer = developer;
            this.loadDeveloperBids();
          },
          error: (err) => {
            this.loading = false;
            this.notificationService.showErrorCustom('Error al cargar datos del desarrollador');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showErrorCustom('Error al cargar datos de usuario');
      }
    });
  }

  private loadDeveloperBids(): void {
    this.bidService.listBids({ developer_id: this.userId }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.bids = Array.isArray(response.data) ? response.data : [response.data];
          this.filteredBids = [...this.bids];
          
          // Extraer proyectos únicos para los filtros
          this.projects = this.bids
            .map(bid => bid.auction.project)
            .filter((project, index, self) => 
              index === self.findIndex(p => p.id === project.id)
            );
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showErrorCustom('Error al cargar las Pujas');
      }
    });
  }

  filterBids(): void {
    this.filteredBids = this.bids.filter(bid => {
      const projectMatch = !this.selectedProject || bid.auction.project_id === this.selectedProject.id;
      const statusMatch = this.selectedStatus === null || bid.auction.status === this.selectedStatus;
      return projectMatch && statusMatch;
    });
  }

  onGlobalFilter(table: any, event: any): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  getStatusLabel(status: any): any {
    const statusMap: Record<string, string> = {
      '0': 'Enviada',
      '1': 'Ganada',
      '2': 'Perdida',
    };
    return statusMap[status] || 'Desconocido';
  }

  getStatusSeverity(status: any): any {
    const severityMap: Record<string, string> = {
      '0': 'warning',
      '1': 'success',
      '2': 'info',
      '3': 'danger'
    };
    return severityMap[status] || '';
  }

  viewBidDetails(bid: Bid): void {
    this.router.navigate(['/main/bids/detail', bid.id]);
  }

  viewPublicAuction(auction: any): void {
    this.router.navigate(['/main/auctions/public', auction.id]);
  }
}