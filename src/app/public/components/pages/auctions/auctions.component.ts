import { Component, OnInit } from '@angular/core';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { UserService } from 'src/app/core/services/user.service';
import { ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Auction } from 'src/app/core/models/auctions';
import { AuctionService } from 'src/app/core/services/auction.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit {

  public company: any;
  public developer: any;
  projects: any[] = [];
  filteredActiveAuctions: any[] = [];
  searchTerm: string = '';

  @ViewChild('dt') dt: Table | undefined;
  
  auctions: Auction[] = [];
  selectedAuctions: Auction[] = [];
  auction: Auction = {} as Auction;

  showAddEditDialog = false;
  currentAuctionId?: number;

  deleteAuctionDialog: boolean = false;
  deleteAuctionsDialog: boolean = false;

  submitted: boolean = false;
  loading: boolean = false;

  statuses = [
    { label: 'Pendiente', value: 0 },
    { label: 'Activa', value: 1 },
    { label: 'Completada', value: 2 },
    { label: 'Cancelada', value: 3 }
  ];

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
    this.getUserById(this.id);
  }

  loadAuctions(): void {
    this.loading = true;
    this.auctionService.getAuctions()
    .subscribe({
        next: (auctions) => {
            if (this.company) {
                // Lógica existente para empresas
                this.auctions = auctions.filter((auction: any) => {
                    return this.projects.some((project: any) => project.id === auction.project_id);
                });
            } else if (this.developer) {
                // Filtrar solo subastas activas para desarrolladores
                this.auctions = auctions.filter((auction: any) => auction.status === "1");
                this.filteredActiveAuctions = [...this.auctions];
            }
            this.loading = false;
        },
        error: (error) => {
            this.notificationService.showErrorCustom('Error al cargar las subastas');
            this.loading = false;
        }
    });
}
  getStatusLabel(status: any): any {
    switch(status) {
      case "0": return 'Pendiente';
      case "1": return 'Activa';
      case "2": return 'Completada';
      case "3": return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  getStatusSeverity(status: any): any {
    switch(status) {
      case "0": return 'warning';
      case "1": return 'success';
      case "2": return 'info';
      case "3": return 'danger';
      default: return '';
    }
  }

  deleteAuction(auction: Auction): void {
    this.auction = { ...auction };
    this.deleteAuctionDialog = true;
  }

  confirmDelete(): void {
    this.deleteAuctionDialog = false;
    this.auctionService.deleteAuction(this.auction.id).subscribe({
      next: () => {
        this.notificationService.showSuccessCustom('Subasta eliminada exitosamente');
        this.loadAuctions();
        this.auction = {} as Auction;
      },
      error: (error) => {
        this.notificationService.showErrorCustom(error.error?.message || 'Error al eliminar la subasta');
      }
    });
  }

  confirmDeleteSelected(): void {
    this.deleteAuctionsDialog = false;
    if (!this.selectedAuctions || this.selectedAuctions.length === 0) {
      this.notificationService.showErrorCustom('No hay subastas seleccionadas');
      return;
    }

    const deleteOperations = this.selectedAuctions.map(auction => 
      this.auctionService.deleteAuction(auction.id)
    );

    forkJoin(deleteOperations).subscribe({
      next: () => {
        this.notificationService.showSuccessCustom(`${this.selectedAuctions.length} subastas eliminadas`);
        this.loadAuctions();
        this.selectedAuctions = [];
      },
      error: (error) => {
        this.notificationService.showErrorCustom('Error al eliminar algunas subastas');
      }
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

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
    this.loadAuctions();
  }

  loadCompany(userId: number): void {
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.loadProjects(Number(data.id))
        this.company = data;
      },
      error: (error: any) => {
        console.error('Error de carga de la empresa:', error);
      }
    });
  }

  loadProjects(id: any): void {
    this.projectsService.getProjectsByCompany(id)
    .subscribe({
        next: (data: any) => {
            this.projects = data;            
        },
        error: (error) => {
            this.notificationService.showErrorCustom('No se pudo cargar proyectos');
        }
    });
}

  loadDeveloper(id: number): void {
    this.developerService.getDeveloperByIdUser(id)
    .subscribe({
      next: (data: any) => {
        this.developer = data;
        this.loadAuctions()
      },
      error: (error) => {
        console.error('Error de carga del desarrollador:', error);
      }
    });
  }

  filterAuctions(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredActiveAuctions = this.auctions.filter(auction => 
        auction.project?.project_name?.toLowerCase().includes(this.searchTerm) ||
        this.getStatusLabel(auction.status).toLowerCase().includes(this.searchTerm)
    );
  }

  placeBid(auction: Auction): void {
      this.router.navigate(['/main/auctions/bid', auction.id]);
  }

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        if(next.role_id === 1){
          this.loadCompany(next.id)
        }else if(next.role_id === 2){
          this.loadDeveloper(next.id)
        }
      }else{
        
      }
    })
  }

    getUserInfo() {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)['id'];
    } else {
      return null;
    }
  }
  
  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();

  viewPublicAuction(auction: Auction): void {
    this.router.navigate(['/main/auctions/public', auction.id])
  }

}
