import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auction } from 'src/app/core/models/auctions';
import { AuctionService } from 'src/app/core/services/auction.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-public-auction-view',
  templateUrl: './public-auction-view.component.html',
  styleUrls: ['./public-auction-view.component.scss']
})
export class PublicAuctionViewComponent implements OnInit, OnDestroy {
  auction!: Auction;
  loading: boolean = true;
  timeRemaining: string = '';
  private timerSubscription!: Subscription;

  constructor(
    private auctionService: AuctionService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const auctionId = +params['id'];
      if (auctionId) {
        this.loadAuction(auctionId);
      } else {
        this.notificationService.showErrorCustom('ID de subasta no válido');
        this.router.navigate(['/auctions']);
      }
    });
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
        this.startTimer();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/auctions']);
      }
    });
  }

  startTimer(): void {
    this.updateTimeRemaining();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateTimeRemaining();
    });
  }

  updateTimeRemaining(): void {
    if (!this.auction?.bidding_deadline) return;

    const now = new Date();
    const deadline = new Date(this.auction.bidding_deadline);
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      this.timeRemaining = 'La subasta ha finalizado';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  getStatusLabel(status: any): string {
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

  goBack(): void {
    this.router.navigate(['/main/auctions']);
  }
}