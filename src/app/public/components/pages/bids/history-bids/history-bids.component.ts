import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { UserService } from 'src/app/core/services/user.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { Router } from '@angular/router';

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
  
  // Datos del usuario
  company: any = null;
  developer: any = null;
  userId: string = this.getUserInfo();
  
  // Datos de la aplicación
  bids: Bid[] = [];
  filteredBids: Bid[] = [];
  selectedBids: Bid[] = [];
  projects: Project[] = [];
  
  // Filtros
  selectedProject: Project | null = null;
  selectedStatus: number | null = null;
  statusOptions = [
    { label: 'Pendiente', value: 0 },
    { label: 'Activa', value: 1 },
    { label: 'Completada', value: 2 },
    { label: 'Cancelada', value: 3 }
  ];
  
  // Estados UI
  loading = false;
  searchTerm = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private companiesService: CompaniesService,
    private developerService: DeveloperService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.loading = true;
    this.userService.getUsersById(this.userId).subscribe({
      next: (user: any) => {
        if (!user) return;
        
        if (user.role_id === 1) { // Company
          this.loadCompanyData(user.id);
        } else if (user.role_id === 2) { // Developer
          this.loadDeveloperData(user.id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadCompanyData(userId: number): void {
    this.companiesService.getCompanyByUserId(userId).subscribe({
      next: (company) => {
        this.company = company;
        this.loadProjectsAndBids(company.id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadDeveloperData(userId: number): void {
    this.developerService.getDeveloperByIdUser(userId).subscribe({
      next: (developer) => {
        this.developer = developer;
        this.loadDeveloperBids(developer.id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadProjectsAndBids(companyId: number): void {
    setTimeout(() => {
      // Datos mock para compañías
      this.projects = [
        { id: 1, project_name: 'Sistema de Gestión', description: 'Sistema para gestión de inventarios', budget: 15000, company_id: companyId },
      ];

      this.bids = this.generateMockBids().filter(bid => 
        bid.auction.company_id === companyId
      );
      
      this.filteredBids = [...this.bids];
      this.loading = false;
    }, 500);
  }

  private loadDeveloperBids(developerId: number): void {
    setTimeout(() => {
      // Datos mock para desarrolladores
      this.projects = [
        { id: 1, project_name: 'Sistema de Gestión', description: 'Sistema para gestión de inventarios', budget: 15000, company_id: 1 },
      ];

      this.bids = this.generateMockBids().filter(bid => 
        bid.developer_id === developerId
      );
      
      this.filteredBids = [...this.bids];
      this.loading = false;
    }, 500);
  }

  private generateMockBids(): Bid[] {
    const mockBids: Bid[] = [];
    const statuses = [0, 1, 2, 3]; // Pendiente, Activa, Completada, Cancelada
    
    const developers = [
      {
        id: this.developer?.id || 1,
        bio: 'Desarrollador fullstack con 5 años de experiencia',
        user_id: 2,
        linkedin: 'linkedin.com/dev1',
        occupation: 'Fullstack Developer',
        portfolio: 'dev1portfolio.com',
        user: {
          role_id: 2,
          name: 'Alberto Turcios',
          email: 'dev@example.com',
          address: 'Calle 123, Ciudad',
          phone: '555-1234',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
          role: { role_name: 'Developer' }
        }
      },
      {
        id: 2,
        bio: 'Especialista en frontend con React',
        user_id: 3,
        linkedin: 'linkedin.com/dev2',
        occupation: 'Frontend Developer',
        portfolio: 'dev2portfolio.com',
        user: {
          role_id: 2,
          name: 'María García',
          email: 'maria@example.com',
          address: 'Avenida 456, Ciudad',
          phone: '555-5678',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
          role: { role_name: 'Developer' }
        }
      }
    ];

    // Generar 10 ofertas de ejemplo
    for (let i = 1; i <= 10; i++) {
      const project = this.projects[Math.floor(Math.random() * this.projects.length)];
      const developer = developers[Math.floor(Math.random() * developers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const bid: Bid = {
        id: i,
        auction_id: i,
        developer_id: developer.id,
        amount: Math.floor(Math.random() * 10000) + 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auction: {
          id: i,
          project_id: project.id,
          company_id: project.company_id,
          bidding_started_at: new Date().toISOString(),
          bidding_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: status,
          project: project
        },
        developer: developer
      };

      mockBids.push(bid);
    }

    return mockBids;
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

  getStatusLabel(status: any): string {
    const statusMap: Record<string, string> = {
      '0': 'Pendiente',
      '1': 'Activa',
      '2': 'Completada',
      '3': 'Cancelada'
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

  private getUserInfo(): string {
    const token = localStorage.getItem("login-token");
    if (!token) return '';
    
    try {
      const payload = token.split(".")[1];
      return JSON.parse(window.atob(payload))['id'] || '';
    } catch (e) {
      console.error('Error parsing token:', e);
      return '';
    }
  }
}
