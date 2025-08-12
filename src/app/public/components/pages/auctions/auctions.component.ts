import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { forkJoin, Subscription } from 'rxjs';

import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { UserService } from 'src/app/core/services/user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AuctionService } from 'src/app/core/services/auction.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { Auction } from 'src/app/core/models/auctions';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt: Table | undefined;
  
  // Datos del usuario
  company: any = null;
  developer: any = null;
  id: string = this.getUserInfo();
  
  // Datos de la aplicación
  projects: any[] = [];
  auctions: Auction[] = [];
  filteredActiveAuctions: Auction[] = [];
  selectedAuctions: Auction[] = [];
  auction: Auction = {} as Auction;
  
  // Estados y controles UI
  showAddEditDialog = false;
  currentAuctionId?: number;
  deleteAuctionDialog = false;
  deleteAuctionsDialog = false;
  submitted = false;
  loading = false;
  searchTerm = '';
  
  statuses = [
    { label: 'Pendiente', value: '0' },
    { label: 'Activa', value: '1' },
    { label: 'Completada', value: '2' },
    { label: 'Cancelada', value: '3' }
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private developerService: DeveloperService,
    private companiesService: CompaniesService,
    private userService: UserService,
    private auctionService: AuctionService,
    private projectsService: ProjectsService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadInitialData(): void {
    this.loading = true;
    const userSub = this.userService.getUsersById(this.id).subscribe({
      next: (user: any) => {
        if (!user) return;        
        if (user.role_id === 1) {
          this.loadCompanyData(user.id);
        } else if (user.role_id === 2) {
          this.loadDeveloperData(user.id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(userSub);
  }

    private loadDeveloperData(userId: number): void {
    const devSub = this.developerService.getDeveloperByIdUser(userId).subscribe({
      next: (developer) => {
        this.developer = developer;
        this.loadActiveAuctions();
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(devSub);
  }

  private loadCompanyData(userId: number): void {
    const companySub = this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (company) => {
        this.company = company;
        this.loadCompanyProjectsAndAuctions(company.id);
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(companySub);
  }

  private loadCompanyProjectsAndAuctions(companyId: number): void {
    forkJoin([
      this.projectsService.getProjectsByCompany(companyId),
      this.auctionService.getAuctions()
    ]).subscribe({
      next: ([projects, auctions]) => {
        this.projects = projects;
        this.auctions = auctions.filter(auction => 
          projects.some(project => project.id === auction.project_id)
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }


private loadActiveAuctions(): void {
    this.loading = true;
    const auctionsSub = this.auctionService.getAuctions().subscribe({
        next: (auctions) => {
            // Función para convertir UTC a hora local
            const toLocalTime = (utcDate: string) => {
                const date = new Date(utcDate);
                return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            };

            const now = new Date(); // Fecha y hora actual local
            
            // Filtra subastas activas (status === 1) y que no hayan vencido
            this.auctions = auctions.filter((auction: any) => {
                try {
                    // Convertir fechas UTC a local
                    const startedAt = auction.bidding_started_at ? toLocalTime(auction.bidding_started_at) : null;
                    const deadline = auction.bidding_deadline ? toLocalTime(auction.bidding_deadline) : null;

                    // Validar estado y fechas
                    const isActive = auction.status === 1;
                    const isNotStarted = startedAt ? now < startedAt : false;
                    const isNotEnded = deadline ? now < deadline : false;

                    // La subasta es válida si:
                    // 1. Está activa (status === 1)
                    // 2. Ya ha comenzado (si tiene fecha de inicio)
                    // 3. No ha terminado (si tiene fecha de fin)
                    return isActive && 
                           (startedAt ? !isNotStarted : true) && 
                           (deadline ? isNotEnded : true);
                } catch (error) {
                    console.error('Error al procesar fechas de subasta:', auction.id, error);
                    return false; // Si hay error, excluir la subasta
                }
            });

            this.filteredActiveAuctions = [...this.auctions];
            this.loading = false;
        },
        error: (err) => {
            console.error('Error al cargar subastas:', err);
            this.loading = false;
        }
    });
    
    this.subscriptions.add(auctionsSub);
}

calculateTimeLeft(auction: any): string {
    if (!auction.bidding_deadline) return 'Sin fecha límite';
    
    const now = new Date();
    const deadline = new Date(auction.bidding_deadline);
    
    if (deadline < now) return 'Finalizada';
    
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

isAuctionEnded(auction: any): boolean {
    if (!auction.bidding_deadline) return false;
    const deadline = new Date(auction.bidding_deadline);
    return deadline < new Date();
}

  // Métodos de UI y utilidades
  getStatusLabel(status: any): any {
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

  filterAuctions(event: any): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActiveAuctions = this.auctions.filter((auction: any) => 
      auction.project?.project_name?.toLowerCase().includes(value) ||
      this.getStatusLabel(auction.status).toLowerCase().includes(value)
    );
  }

  // Métodos CRUD
  openNew(): void {
    this.currentAuctionId = undefined;
    this.showAddEditDialog = true;
  }

  editAuction(auction: Auction): void {
    this.auction = { ...auction };
    this.currentAuctionId = auction.id;
    this.showAddEditDialog = true;
  }

  onAuctionSaved(): void {
    this.showAddEditDialog = false;
    this.loadInitialData();
  }

  deleteAuction(auction: Auction): void {
    this.auction = { ...auction };
    this.deleteAuctionDialog = true;
  }

  confirmDelete(): void {
    this.deleteAuctionDialog = false;
    const deleteSub = this.auctionService.deleteAuction(this.auction.id).subscribe({
      next: () => {
        this.notificationService.showSuccessCustom('Subasta eliminada exitosamente');
        this.loadInitialData();
        this.auction = {} as Auction;
      }
    });
    
    this.subscriptions.add(deleteSub);
  }

  confirmDeleteSelected(): void {
    this.deleteAuctionsDialog = false;
    
    if (!this.selectedAuctions?.length) {
      this.notificationService.showErrorCustom('No hay subastas seleccionadas');
      return;
    }

    const deleteOperations = this.selectedAuctions.map(auction => 
      this.auctionService.deleteAuction(auction.id)
    );

    forkJoin(deleteOperations).subscribe({
      next: () => {
        this.notificationService.showSuccessCustom(`${this.selectedAuctions.length} subastas eliminadas`);
        this.loadInitialData();
        this.selectedAuctions = [];
      }
    });
  }

  // Navegación
  placeBid(auction: Auction): void {
    this.router.navigate(['/main/auctions/bid', auction.id]);
  }

  viewPublicAuction(auction: any): void {
    this.router.navigate(['/main/auctions/public', auction.id]);
  }

   onGlobalFilter(table: any, event: any): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  // Método alternativo mejorado para filtrado (opcional)
  private applyGlobalFilter(value: string): void {
    if (this.dt) {
      this.dt.filterGlobal(value, 'contains');
    }
  }

  // Helpers
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