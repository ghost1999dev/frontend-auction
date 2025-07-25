import { Component, OnInit, OnDestroy } from "@angular/core";
import { Auction } from "src/app/core/models/auctions";
import { AuctionService } from "src/app/core/services/auction.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, interval } from "rxjs";

@Component({
  selector: "app-public-auction-view",
  templateUrl: "./public-auction-view.component.html",
  styleUrls: ["./public-auction-view.component.scss"],
})
export class PublicAuctionViewComponent implements OnInit, OnDestroy {
  auction!: Auction;
  loading: boolean = true;
  timeRemaining: string = "";
  private timerSubscription!: Subscription;
  public timeDifference: string = "";

  constructor(
    private auctionService: AuctionService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const auctionId = +params["id"];
      if (auctionId) {
        this.loadAuction(auctionId);
      } else {
        this.notificationService.showErrorCustom("ID de subasta no válido");
        this.router.navigate(["/auctions"]);
      }
    });
    this.startTimer();
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

      const startedAt = toLocalTime(this.auction.bidding_started_at);
      const deadline = toLocalTime(this.auction.bidding_deadline);

      const msPerSecond = 1000;
      const msPerMinute = 60 * msPerSecond;
      const msPerHour = 60 * msPerMinute;
      const msPerDay = 24 * msPerHour;

      const formatLocal = (date: Date) =>
        date.toLocaleString("es-SV", {
          timeZone: "America/El_Salvador",
          hour12: false,
        });

      console.group("Timer Debug (Hora Local)");
      console.log("Ahora:", formatLocal(now));
      console.log("Inicio:", formatLocal(startedAt));
      console.log("Fin:", formatLocal(deadline));
      console.groupEnd();

      if (now >= deadline) {
        this.timeDifference = "✅ Subasta finalizada";
      } else if (now < startedAt) {
        const diff = startedAt.getTime() - now.getTime();
        const days = Math.floor(diff / msPerDay);
        const hours = Math.floor((diff % msPerDay) / msPerHour);
        const minutes = Math.floor((diff % msPerHour) / msPerMinute);
        const seconds = Math.floor((diff % msPerMinute) / msPerSecond);

        this.timeDifference =
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
          this.timeDifference = `⏱️ ${days}d ${hours}h ${minutes}m ${seconds}s`;
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

          this.timeDifference = "⏱️ " + timeParts.join(" ");
        }
      }
    } catch (error) {
      console.error("❌ Error en timer:", error);
      this.timeDifference = "⚠️ Error en cálculo";
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadAuction(auctionId: number): void {
    this.loading = true;
    this.auctionService.getAuctionById(auctionId).subscribe({
      next: (auction) => {
        this.auction = auction;
        this.loading = false;
        this.startTimer();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(["/auctions"]);
      },
    });
  }

  /*   startTimer(): void {
    // Primero calculamos el tiempo restante
    this.updateTimeRemaining();

    // Luego actualizamos cada segundo
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateTimeRemaining();
    });
  }

updateTimeRemaining(): void {
  try {
    // 1. Obtener la hora actual en El Salvador (GMT-6)
    const now = new Date();
    
    // 2. Parsear fechas UTC del servidor
    const startedAtUTC = new Date(this.auction.bidding_started_at);
    const deadlineUTC = new Date(this.auction.bidding_deadline);
    
    // 3. Convertir a hora local (El Salvador) - método preciso
    const options = { timeZone: 'America/El_Salvador' };
    const startedAtLocal = new Date(startedAtUTC.toLocaleString('en-US', options));
    const deadlineLocal = new Date(deadlineUTC.toLocaleString('en-US', options));

    // 4. Depuración avanzada
    console.log('Hora actual (CST):', now.toString());
    console.log('Inicio UTC:', this.auction.bidding_started_at, '→ Local:', startedAtLocal.toString());
    console.log('Fin UTC:', this.auction.bidding_deadline, '→ Local:', deadlineLocal.toString());
    console.log('Diferencia UTC:', (deadlineUTC.getTime() - startedAtUTC.getTime()) / 3600000 + ' horas');
    console.log('Diferencia Local:', (deadlineLocal.getTime() - startedAtLocal.getTime()) / 3600000 + ' horas');

    // 5. Calcular tiempo restante
    const diff = deadlineLocal.getTime() - now.getTime();
    
    // 6. Mostrar resultados
    if (diff <= 0) {
      this.timeRemaining = 'Finalizada';
    } else {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      // Mostrar en formato 24h
      this.timeRemaining = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
  } catch (error) {
    console.error('Error en timer:', error);
    this.timeRemaining = '--:--:--';
  }
} */

  // Añade esta función a tu componente
  calculateTimeDifference(): string {
    const startedAt = new Date(this.auction.bidding_started_at);
    const deadline = new Date(this.auction.bidding_deadline);

    // Calcular diferencia en milisegundos
    const diff = deadline.getTime() - startedAt.getTime();

    // Calcular horas, minutos y segundos
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  getStatusLabel(status: any): any {
    const statusMap: Record<string, string> = {
      "0": "Pendiente",
      "1": "Activa",
      "2": "Completada",
      "3": "Cancelada",
    };
    return statusMap[status] || "Desconocido";
  }

  getStatusSeverity(status: any): any {
    const severityMap: Record<string, string> = {
      "0": "warning",
      "1": "success",
      "2": "info",
      "3": "danger",
    };
    return severityMap[status] || "";
  }

  goBack(): void {
    this.router.navigate(["/main/auctions"]);
  }
}
