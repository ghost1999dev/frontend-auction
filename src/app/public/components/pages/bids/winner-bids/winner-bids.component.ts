import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import confetti from 'canvas-confetti';
import { finalize } from 'rxjs/operators';
import { AuctionResultsResponse, AuctionResults, WinnerHistoryResponse, WinnerHistory } from 'src/app/core/models/bids';
import { BidService } from 'src/app/core/services/bids.service';
import { NotificationService } from 'src/app/core/services/notification.service';

interface Winner {
  id: number;
  position: number;
  name: string;
  amount: number;
  avatar: string;
  time: string;
  developer_id: number;
  status: string;
  email?: string;
  is_winner?: boolean;
}

interface DialogConfig {
  header: string;
  message: string;
  type: 'info' | 'confirm' | 'rating' | 'success';
  winner?: Winner;
}

interface ProjectDetails {
  project_name: string;
  description: string;
  budget: number;
  company?: {
    name: string;
  };
}

type ProjectStatus = 'not_assigned' | 'assigned' | 'in_progress' | 'review' | 'completed';

@Component({
  selector: 'app-winner-bids',
  templateUrl: './winner-bids.component.html',
  styleUrls: ['./winner-bids.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class WinnerBidsComponent implements OnInit {
  winners: Winner[] = [
    { id: 0, position: 1, name: 'Cargando...', amount: 0, avatar: '', time: '', developer_id: 0, status: '' },
    { id: 0, position: 2, name: 'Cargando...', amount: 0, avatar: '', time: '', developer_id: 0, status: '' },
    { id: 0, position: 3, name: 'Cargando...', amount: 0, avatar: '', time: '', developer_id: 0, status: '' }
  ];
  auctionId: number = 0;
  auctionName: string = 'Cargando...';
  auctionDescription: string = 'Cargando detalles...';
  initialBudget: number = 0;
  totalBids: number = 0;
  selectedWinner: Winner | null = null;
  rating: number = 0;
  comment: string = '';
  isLoading: boolean = true;
  isSelectingWinner: boolean = false;
  projectDetails: ProjectDetails | null = null;

  displayConfirmationDialog: boolean = false;
  selectedWinnerToConfirm: Winner | null = null;

  dialogConfig: DialogConfig = {
    header: '',
    message: '',
    type: 'info'
  };

  displayDialog: boolean = false;
  projectStatus: ProjectStatus = 'not_assigned';
  projectDates = {
    assigned: new Date(),
    started: new Date(),
    delivered: new Date(),
    completed: new Date()
  };

  constructor(
    private route: ActivatedRoute,
    private bidService: BidService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.params['id'] || 0;
    if (!this.auctionId) {
      this.notificationService.showErrorCustom('No se proporcionó un ID de subasta válido');
      return;
    }

    this.loadAuctionResults();
    this.loadWinnerHistory();
    this.loadProjectStatus();
  }

  private loadAuctionResults(): void {
    this.isLoading = true;
    this.bidService.getAuctionResults(this.auctionId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: AuctionResultsResponse) => {
          this.processResults(response.data);
          this.fireConfetti();
          this.loadAuctionDetails();
        },
        error: (error) => {
          console.error('Error loading auction results:', error);
          this.notificationService.showErrorCustom('No se pudieron cargar los resultados de la subasta');
        }
      });
  }

  private loadWinnerHistory(): void {
    this.bidService.getWinnersHistory()
      .subscribe({
        next: (response: WinnerHistoryResponse) => {
          const winnerForThisAuction = response.data.find(winner => winner.auction_id === this.auctionId);
          if (winnerForThisAuction) {
            this.markWinnerInWinnersList(winnerForThisAuction);
            this.projectStatus = 'assigned';
          }
        },
        error: (error) => {
          console.error('Error loading winner history:', error);
        }
      });
  }

  private markWinnerInWinnersList(winnerHistory: WinnerHistory): void {
    this.winners = this.winners.map(winner => {
      if (winner.id === winnerHistory.bid_id) {
        return {
          ...winner,
          is_winner: true
        };
      }
      return winner;
    });

    this.selectedWinner = this.winners.find(winner => winner.is_winner) || null;
  }

  private loadAuctionDetails(): void {
    this.bidService.listBidsByAuction(this.auctionId)
      .subscribe({
        next: (response: any) => {
          if (response) {
            const firstBid = Array.isArray(response.data) ? response.data[0] : response.data;
            if (firstBid?.auction?.project) {
              this.projectDetails = {
                project_name: firstBid.auction.project.project_name,
                description: firstBid.auction.project.description,
                budget: firstBid.auction.project.budget || 0,
                company: firstBid.auction.project.company
              };
              
              this.auctionName = this.projectDetails.project_name;
              this.auctionDescription = this.projectDetails.description;
              this.initialBudget = this.projectDetails.budget;
              this.totalBids = Array.isArray(response.data) ? response.data.length : 1;
            }
          }
        },
        error: (error) => {
          console.error('Error loading auction details:', error);
        }
      });
  }

  private processResults(results: AuctionResults[]): void {
    if (!results || results.length === 0) {
      this.winners = [
        { id: 0, position: 1, name: 'No hay ganadores', amount: 0, avatar: this.getRandomAvatar(), time: '--:-- --', developer_id: 0, status: 'No disponible' },
        { id: 0, position: 2, name: 'No hay ganadores', amount: 0, avatar: this.getRandomAvatar(), time: '--:-- --', developer_id: 0, status: 'No disponible' },
        { id: 0, position: 3, name: 'No hay ganadores', amount: 0, avatar: this.getRandomAvatar(), time: '--:-- --', developer_id: 0, status: 'No disponible' }
      ];
      return;
    }

    // Ordenar por amount (ascendente para subasta inversa)
    const sortedResults = [...results].sort((a, b) => a.amount - b.amount);
    
    // Mapear a la estructura de Winner
    this.winners = sortedResults.slice(0, 3).map((result, index) => ({
      id: result.id,
      position: index + 1,
      name: result.developer_profile?.user?.name || 'Desarrollador ' + (index + 1),
      amount: result.amount,
      avatar: this.getRandomAvatar(),
      time: new Date(result.createdAt).toLocaleTimeString(),
      developer_id: result.developer_id,
      status: result.status,
      email: result.developer_profile?.user?.email,
      is_winner: false
    }));

    // Si hay menos de 3 resultados, completar con placeholders
    while (this.winners.length < 3) {
      this.winners.push({
        id: 0,
        position: this.winners.length + 1,
        name: 'No disponible',
        amount: 0,
        avatar: this.getRandomAvatar(),
        time: '--:-- --',
        developer_id: 0,
        status: 'No disponible',
        is_winner: false
      });
    }
  }

  private getRandomAvatar(): string {
    const avatars = ['1.avif', '2.jpeg', '3.avif'];
    return `assets/images/${avatars[Math.floor(Math.random() * avatars.length)]}`;
  }

  selectWinner(winner: Winner): void {
    if (winner.status !== "Ganador") {
      this.notificationService.showErrorCustom('Solo puedes seleccionar un ganador oficial de la subasta');
      return;
    }

    this.selectedWinnerToConfirm = winner;
    this.displayConfirmationDialog = true;
  }

  confirmSelection(): void {
    if (this.selectedWinnerToConfirm) {
      this.assignWinner(this.selectedWinnerToConfirm);
      this.displayConfirmationDialog = false;
    }
  }

  assignWinner(winner: Winner): void {
    this.isSelectingWinner = true;
    this.bidService.chooseWinner({
      auction_id: this.auctionId,
      winner_bid: winner.id
    }).subscribe({
      next: (response) => {
        this.notificationService.showSuccessCustom(response.message || 'Ganador seleccionado correctamente');
        this.selectedWinner = winner;
        this.projectStatus = 'assigned';
        this.saveProjectStatus();
        this.isSelectingWinner = false;
        
        // Update the winners list to mark the selected winner
        this.winners = this.winners.map(w => ({
          ...w,
          is_winner: w.id === winner.id
        }));
      },
      error: (error) => {
        console.error('Error selecting winner:', error);
        this.notificationService.showErrorCustom(error.error?.message || 'No se pudo seleccionar al ganador');
        this.isSelectingWinner = false;
      }
    });
  }

  private saveProjectStatus(): void {
    // You might want to save this to backend in a real application
    // For now, we'll keep it in memory since we're removing localStorage
  }

  private loadProjectStatus(): void {
    // In a real app, you would fetch this from the backend
    // For now, we'll just set a default status
    this.projectStatus = 'not_assigned';
    
    // Update dates (just for demonstration)
    const now = new Date();
    this.projectDates = {
      assigned: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)), // 15 días atrás
      started: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)),  // 10 días atrás
      delivered: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 días atrás
      completed: new Date()
    };
  }

  updateProjectStatus(newStatus: ProjectStatus): void {
    if (newStatus === 'not_assigned') return;
    
    this.projectStatus = newStatus;
    
    let message = '';
    switch(newStatus) {
      case 'assigned':
        message = 'El proyecto ha sido asignado al desarrollador';
        break;
      case 'in_progress':
        message = 'El proyecto ha sido marcado como "En Progreso"';
        break;
      case 'review':
        message = 'El proyecto ha sido marcado como "En Revisión"';
        break;
      case 'completed':
        message = '¡Felicidades! El proyecto ha sido completado';
        break;
    }
    
    this.notificationService.showSuccessCustom(message);
  }

  rateDeveloper(): void {
    if (!this.selectedWinner) return;

    this.dialogConfig = {
      header: 'Calificar desarrollador',
      message: `Califica a ${this.selectedWinner.name}`,
      type: 'rating'
    };
    this.displayDialog = true;
    this.rating = 0;
    this.comment = '';
  }

  onDialogConfirm(confirmed: boolean): void {
    if (!confirmed) {
      this.displayDialog = false;
      return;
    }

    if (this.dialogConfig.type === 'rating' && this.rating > 0 && this.selectedWinner) {
      this.notificationService.showSuccessCustom(
        `Has calificado a ${this.selectedWinner.name} con ${this.rating} estrellas`
      );
      
      this.projectStatus = 'completed';
    }

    this.displayDialog = false;
  }

  fireConfetti() {
    const count = 400;
    const defaults: confetti.Options = {
      origin: { y: 0.6 },
      spread: 85,
      startVelocity: 45,
      ticks: 300,
      gravity: 0.4,
      decay: 0.92,
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#FF0080', '#00FF80', '#FFFFFF'],
      scalar: 1.3,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true
    };

    const fire = (particleRatio: number, opts: Partial<confetti.Options> = {}) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    };

    fire(0.3, { spread: 35, startVelocity: 65, decay: 0.89, scalar: 1.5 });
    fire(0.25, { spread: 80, ticks: 350, gravity: 0.3 });
    fire(0.35, { spread: 120, decay: 0.94, scalar: 1.1, gravity: 0.35 });

    setTimeout(() => {
      fire(0.15, { spread: 150, startVelocity: 30, decay: 0.96, scalar: 1.4 });
      fire(0.15, { spread: 150, startVelocity: 50, ticks: 400, scalar: 1.6 });

      confetti({
        ...defaults,
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      
      confetti({
        ...defaults,
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });
    }, 800);

    setTimeout(() => {
      fire(0.2, { spread: 100, startVelocity: 25, decay: 0.98, ticks: 500, gravity: 0.2, scalar: 1.8 });
      setTimeout(() => {
        fire(0.1, { spread: 200, startVelocity: 20, decay: 0.99, ticks: 600, gravity: 0.1, scalar: 2.0 });
      }, 500);
    }, 1800);
  }
}