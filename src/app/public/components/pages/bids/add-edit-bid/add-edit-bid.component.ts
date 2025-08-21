import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuctionService } from 'src/app/core/services/auction.service';
import { UserService } from 'src/app/core/services/user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Auction } from 'src/app/core/models/auctions';
import { Bid } from 'src/app/core/models/bids';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { BidService } from 'src/app/core/services/bids.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-add-edit-bid',
  templateUrl: './add-edit-bid.component.html',
  styleUrls: ['./add-edit-bid.component.scss']
})
export class AddEditBidComponent implements OnInit, OnDestroy {
  // Datos de subastas
  activeAuctions: any[] = [];
  selectedAuction: any | null = null;
  auctionBids: any[] = [];
  bidHistory: any[] = [];
  currentLowestBid: number = 0;
  quickBidAmounts: number[] = [];
  bidAmount: number | null = null;
  minAllowedBid: any;
  selectedProject: any | null = null;

  private pollingInterval = 4000; // 4 segundos
  private pollingSubscription!: Subscription;
  // Estado y temporizador
  auctionEnded: boolean = false;
  timeLeft: string = "";
  private timerSubscription!: Subscription;

  // Roles y usuario
  developer: any = null;
  company: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auctionService: AuctionService,
    private bidService: BidService,
    private userService: UserService,
    private ProjectSrv: ProjectsService,
    private developerService: DeveloperService,
    private companiesService: CompaniesService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

// Agrega este método para iniciar el polling
private startPolling(): void {
  this.stopPolling();
  this.pollingSubscription = interval(this.pollingInterval).subscribe(() => {
    if (this.selectedAuction) {
      this.loadAuctionBids(this.selectedAuction.id);
      if (this.developer) {
        this.loadBidHistory();
      }
    }
  });
}


// Método para detener el polling
private stopPolling(): void {
  if (this.pollingSubscription) {
    this.pollingSubscription.unsubscribe();
  }
}

// Modifica el método ngOnDestroy para detener el polling también
ngOnDestroy(): void {
  if (this.timerSubscription) {
    this.timerSubscription.unsubscribe();
  }
  this.stopPolling();
}

  private loadInitialData(): void {
    this.userService.getUsersById(this.id).subscribe({
      next: (user: any) => {
        if (!user) return;
        
        if (user.role_id === 1) {
          this.loadCompanyData(user.id);
        } else if (user.role_id === 2) {
          this.loadDeveloperData(user.id);
        }
        
        this.loadAuctions();
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar datos de usuario');
        this.router.navigate(['/main/auctions']);
      }
    });
  }

  private loadCompanyData(userId: number): void {
    this.companiesService.getCompanyByUserId(userId).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: (err) => {
        console.error('Error al cargar datos de compañía:', err);
      }
    });
  }

  private loadDeveloperData(userId: number): void {
    this.developerService.getDeveloperByIdUser(userId).subscribe({
      next: (developer) => {
        this.developer = developer;
        this.loadBidHistory();
      },
      error: (err) => {
        console.error('Error al cargar datos de desarrollador:', err);
      }
    });
  }

  private loadAuctions(): void {
    this.auctionService.getAuctions().subscribe({
      next: (auctions) => {
        this.activeAuctions = auctions;
        
        // Seleccionar subasta de la ruta si existe
        const auctionId = this.route.snapshot.params['id'];
        if (auctionId) {
          const auction = this.activeAuctions.find(a => a.id === +auctionId);
          if (auction) {
            this.selectAuction(auction);
          } else {
            this.notificationService.showErrorCustom('Subasta no encontrada');
            this.router.navigate(['/main/auctions']);
          }
        }
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar las subastas');
      }
    });
  }

  loadProjectById(id: any){
    this.ProjectSrv.getProjectById(id)
    .subscribe({
      next: (data: any) => {
        this.selectedProject = data
      }
    })
  }

selectAuction(auction: Auction): void {
  this.selectedAuction = auction;
  this.minAllowedBid = auction.project?.budget ? auction.project.budget * 0.5 : 0;
  this.auctionEnded = new Date(auction.bidding_deadline) < new Date();
  
  this.loadAuctionBids(auction.id);
  this.startTimer();
  this.loadProjectById(auction.project_id);
  this.startPolling(); // <-- Iniciar polling cuando se selecciona una subasta
}

  private loadAuctionBids(auctionId: number): void {
    this.bidService.listBids({ auction_id: auctionId }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.auctionBids = Array.isArray(response.data) ? response.data : [response.data];
          this.updateCurrentLowestBid();
        }
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar las Pujas');
      }
    });
  }

  private loadBidHistory(): void {
    if (!this.developer) return;
    
    this.bidService.listBids({ developer_id: this.id }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bidHistory = Array.isArray(response.data) ? response.data : [response.data];
        }
      },
      error: (err) => {
        console.error('Error al cargar historial de Pujas:', err);
      }
    });
  }

  private updateCurrentLowestBid(): void {
    if (this.auctionBids.length > 0) {
      this.currentLowestBid = Math.min(...this.auctionBids.map(bid => bid.amount));
    } else if (this.selectedAuction?.project?.budget) {
      this.currentLowestBid = this.selectedAuction.project.budget;
    }
    this.generateQuickBidButtons();
  }

  compareBids(bidAmount: number, currentLowest: number): boolean {
  // Redondear a 2 decimales y comparar
  return Number(bidAmount.toFixed(2)) === Number(currentLowest.toFixed(2));
}

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateTimeDifference();
    });
  }

  updateTimeDifference(): void {
    try {
      const now = new Date();

      const toLocalTime = (utcDate: string) => {
        const date = new Date(utcDate);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      };

      const startedAt = toLocalTime(this.selectedAuction.bidding_started_at);
      const deadline = toLocalTime(this.selectedAuction.bidding_deadline);

      const msPerSecond = 1000;
      const msPerMinute = 60 * msPerSecond;
      const msPerHour = 60 * msPerMinute;
      const msPerDay = 24 * msPerHour;

      this.auctionEnded = now >= deadline;

      const formatLocal = (date: Date) =>
        date.toLocaleString("es-SV", {
          timeZone: "America/El_Salvador",
          hour12: false,
        });

      if (now >= deadline) {
        this.timeLeft = "✅ Subasta finalizada";
      } else if (now < startedAt) {
        const diff = startedAt.getTime() - now.getTime();
        const days = Math.floor(diff / msPerDay);
        const hours = Math.floor((diff % msPerDay) / msPerHour);
        const minutes = Math.floor((diff % msPerHour) / msPerMinute);
        const seconds = Math.floor((diff % msPerMinute) / msPerSecond);

        this.timeLeft =
          days > 0
            ? `⏳ Comienza en ${days}d ${hours}h ${minutes}m ${seconds}s`
            : `⏳ Comienza en ${hours}h ${minutes}m ${seconds}s`;
      } else {
        const diff = deadline.getTime() - now.getTime();
        const days = Math.floor(diff / msPerDay);
        const hours = Math.floor((diff % msPerDay) / msPerHour);
        const minutes = Math.floor((diff % msPerHour) / msPerMinute);
        const seconds = Math.floor((diff % msPerMinute) / msPerSecond);

        if (days > 0) {
          this.timeLeft = `Finalizara en: ⏱️ ${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          let timeParts = [];

          if (hours > 0) {
            timeParts.push(`${hours.toString().padStart(2, "0")}h`);
          }

          if (minutes > 0 || hours > 0) {
            // Mostrar minutos si hay horas o si hay minutos
            timeParts.push(`${minutes.toString().padStart(2, "0")}m`);
          }

          // Siempre mostramos segundos
          timeParts.push(`${seconds.toString().padStart(2, "0")}s`);

          this.timeLeft = "Finalizara en: ⏱️ " + timeParts.join(" ");
        }
      }
    } catch (error) {
      console.error("❌ Error en timer:", error);
      this.timeLeft = "⚠️ Error en cálculo";
    }
  }

  finalizeAuction(): void {
    if (!this.selectedAuction) return;

    this.bidService.finalizeAuction(this.selectedAuction.id).subscribe({
        next: (response) => {
            if (response.success) {
                this.notificationService.showSuccessCustom('Subasta finalizada con éxito');
                // Actualizar el estado de la subasta
                this.selectedAuction.status = 2;

                // Obtener los resultados actualizados

                this.router.navigate(['/main/winner-bid/auction', this.selectedAuction.id]);

            }
        },
        error: (err) => {
            this.notificationService.showErrorCustom('Error al finalizar la subasta');
        }
    });
}

  private generateQuickBidButtons(): void {
    this.quickBidAmounts = [];
    const baseAmount = this.currentLowestBid;

    for (let i = 1; i <= 5; i++) {
      const discountPercentage = i * 0.05;
      const calculatedAmount = baseAmount * (1 - discountPercentage);
      
      if (calculatedAmount >= this.minAllowedBid) {
        this.quickBidAmounts.push(Math.round(calculatedAmount));
      }
    }
  }

  changeClass(): string {
    return this.developer ? 'col-6' : 'col-9';
  }

  getValidQuickBidAmounts(): number[] {
    return this.quickBidAmounts.filter(amount => amount >= this.minAllowedBid);
  }

  placeBid(amount: number): void {
    if (!this.selectedAuction || !this.developer) return;

    // Validaciones
    if (amount <= 0) {
      this.notificationService.showErrorCustom('El monto debe ser positivo');
      return;
    }

    if (this.auctionEnded) {
      this.notificationService.showErrorCustom('La subasta ha finalizado');
      return;
    }

    if (amount < this.minAllowedBid) {
      this.notificationService.showErrorCustom(`El monto mínimo permitido es ${this.minAllowedBid}`);
      return;
    }

    if (amount >= this.currentLowestBid) {
      this.notificationService.showErrorCustom('Tu Puja debe ser menor que la Puja actual más baja');
      return;
    }

    const bidData = {
      auction_id: this.selectedAuction.id,
      amount: amount,
      user_id: this.id
    };

    this.bidService.createBid(bidData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccessCustom('Puja realizada con éxito');
          this.loadAuctionBids(this.selectedAuction!.id);
          this.loadBidHistory();
          this.bidAmount = null;
        }
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al realizar la Puja');
      }
    });
  }

  filterUserBids(bids: any[]): any[] {
    return bids
      .filter(bid => bid.developer_id === this.id)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getStatusLabel(status: any) {
    const statusMap: Record<any, any> = {
      0: "Pendiente",
      1: "En Progreso",
      2: "Completada",
      3: "Cancelada",
    };
    return statusMap[status] || "Desconocido";
  }

  getStatusSeverity(status: any) {
    const severityMap: Record<any, any> = {
      0: "warning",
      1: "success",
      2: "info",
      3: "danger",
    };
    return severityMap[status] || "";
  }

  getUserInfo(data: string) {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)[data];
    } else {
      return null;
    }
  }

  getTokens() {
    return localStorage.getItem("login-token");
  }

  profile_id: any = this.getUserInfo("profile_id");
  id: any = this.getUserInfo("id");

}