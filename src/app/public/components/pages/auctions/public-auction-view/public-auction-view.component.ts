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

    if(days > 0){
      this.timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }if(days === 0){
      this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
    }if(hours === 0){
      this.timeRemaining = `${minutes}m ${seconds}s`;
    }if(minutes === 0){
      this.timeRemaining = `${seconds}s`;
    }

  }

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

  goBack(): void {
    this.router.navigate(['/main/auctions']);
  }
}