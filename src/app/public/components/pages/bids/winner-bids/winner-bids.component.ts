import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import confetti from 'canvas-confetti';

interface Winner {
  position: number;
  name: string;
  amount: number;
  avatar: string;
  time: string;
}

interface DialogConfig {
  header: string;
  message: string;
  type: 'info' | 'confirm' | 'rating' | 'success';
  winner?: Winner;
}

interface RatingDialogConfig {
  score: number;
  comment?: string;
  isVisible?: boolean;
}


@Component({
  selector: 'app-winner-bids',
  templateUrl: './winner-bids.component.html',
  styleUrls: ['./winner-bids.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class WinnerBidsComponent implements OnInit {
  winners: Winner[] = [];
  auctionId: number = 0;
  auctionName: string = 'Sistema de Gestión';
  auctionDescription: string = 'Sistema para gestión de inventarios';
  initialBudget: number = 15000;
  totalBids: number = 24;
  selectedWinner: Winner | null = null;
  rating: number = 0;
  comment: string = '';

  dialogConfig: DialogConfig = {
    header: '',
    message: '',
    type: 'info'
  };

  ratingDialogConfig: RatingDialogConfig = {
    isVisible: false,
    score: 0,
    comment: ''
  };

  displayDialog: boolean = false;

  private storageKey: string;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.storageKey = `selectedWinner_${this.auctionId}`;
  }

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.params['id'] || 1;
    this.storageKey = `selectedWinner_${this.auctionId}`;
    this.loadMockData();
    this.fireConfetti();
    this.loadSelectedWinner();
  }

   fireConfetti() {
  // Configuración base con tipos correctos
  const count = 400;
  const defaults: confetti.Options = {
    origin: { y: 0.6 },
    spread: 85,
    startVelocity: 45,
    ticks: 300,
    gravity: 0.4,
    decay: 0.92,
    colors: [
      '#FF0000', '#00FF00', '#0000FF',
      '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF8000', '#FF0080', '#00FF80',
      '#FFFFFF'
    ],
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

  // Disparos iniciales
  fire(0.3, { 
    spread: 35, 
    startVelocity: 65,
    decay: 0.89,
    scalar: 1.5,
    colors: ['#FF0000', '#FFFF00', '#FFFFFF']
  });
  
  fire(0.25, { 
    spread: 80,
    ticks: 350,
    gravity: 0.3,
    colors: ['#00FF00', '#00FFFF', '#FFFFFF']
  });
  
  fire(0.35, { 
    spread: 120, 
    decay: 0.94,
    scalar: 1.1,
    gravity: 0.35,
    shapes: ['circle'] as const
  });

  // Disparos con delay
  setTimeout(() => {
    fire(0.15, { 
      spread: 150, 
      startVelocity: 30, 
      decay: 0.96, 
      scalar: 1.4,
      colors: ['#0000FF', '#00FFFF', '#FFFFFF'],
      shapes: ['square'] as const
    });
    
    fire(0.15, { 
      spread: 150, 
      startVelocity: 50,
      ticks: 400,
      colors: ['#FF0000', '#FF8000', '#FFFF00'],
      scalar: 1.6
    });

    // Disparos laterales con tipos explícitos
    confetti({
      ...defaults,
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF0000', '#FF8000']
    });
    
    confetti({
      ...defaults,
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#0000FF', '#00FFFF']
    });
  }, 800);

  // Fase final
  setTimeout(() => {
    fire(0.2, {
      spread: 100,
      startVelocity: 25,
      decay: 0.98,
      ticks: 500,
      gravity: 0.2,
      scalar: 1.8,
      colors: ['#FF00FF', '#FFFFFF', '#FFFF00']
    });
    
    setTimeout(() => {
      fire(0.1, {
        spread: 200,
        startVelocity: 20,
        decay: 0.99,
        ticks: 600,
        gravity: 0.1,
        scalar: 2.0
      });
    }, 500);
  }, 1800);
}

  private loadSelectedWinner(): void {
    const savedWinner = localStorage.getItem(this.storageKey);
    if (savedWinner) {
      this.selectedWinner = JSON.parse(savedWinner);
    }
  }

  selectWinner(winner: Winner): void {
    this.showDialog({
      header: 'Confirmar selección',
      message: `¿Estás seguro de seleccionar a ${winner.name} como ganador?`,
      type: 'confirm',
      winner
    });
  }

  clearSelection(): void {
    this.showDialog({
      header: 'Confirmar acción',
      message: '¿Estás seguro que deseas limpiar la selección actual?',
      type: 'confirm'
    });
  }

  rateDeveloper(): void {
    if (this.selectedWinner) {
      this.showDialog({
        header: 'Calificar desarrollador',
        message: `Califica a ${this.selectedWinner.name}`,
        type: 'rating'
      });
    }
  }

  showRatingDialog(): void {
  this.ratingDialogConfig = {
    score: 0,
    comment: '',
    isVisible: true
  };
}

onRatingDialogClose(): void {
  this.ratingDialogConfig.isVisible = false;
}

submitRating(): void {
  if (this.ratingDialogConfig.score > 0 && this.selectedWinner) {
    // Aquí iría la lógica para guardar la calificación y comentario
    console.log('Rating submitted:', {
      developer: this.selectedWinner.name,
      score: this.ratingDialogConfig.score,
      comment: this.ratingDialogConfig.comment
    });

    this.showSuccessMessage(
      'Calificación enviada',
      `Has calificado a ${this.selectedWinner.name} con ${this.ratingDialogConfig.score} estrellas`
    );
    
    // Resetear el estado
    this.selectedWinner = null;
    this.ratingDialogConfig = {
      score: 0,
      comment: '',
      isVisible: false
    };
  }
}

  showDialog(config: DialogConfig): void {
    this.dialogConfig = config;
    this.displayDialog = true;
  }

  onDialogConfirm(confirmed: boolean): void {
    if (!confirmed) {
      this.displayDialog = false;
      return;
    }

    switch (this.dialogConfig.type) {
      case 'confirm':
        if (this.dialogConfig.winner) {
          // Confirm winner selection
          this.selectedWinner = this.dialogConfig.winner;
          localStorage.setItem(this.storageKey, JSON.stringify(this.selectedWinner));
          this.showSuccessMessage('Ganador seleccionado', `${this.selectedWinner.name} ha sido seleccionado como ganador`);
        } else {
          // Confirm clear selection
          this.selectedWinner = null;
          localStorage.removeItem(this.storageKey);
          this.showSuccessMessage('Selección limpiada', 'Puedes elegir otro ganador si lo deseas');
        }
        break;

      case 'rating':
        if (this.rating > 0 && this.selectedWinner) {
          this.showSuccessMessage(
            'Calificación enviada',
            `Has calificado a ${this.selectedWinner.name} con ${this.rating} estrellas`
          );
          this.selectedWinner = null;
          this.rating = 0;
        }
        break;
    }

    this.displayDialog = false;
  }

  private showSuccessMessage(header: string, message: string): void {
    this.dialogConfig = {
      header,
      message,
      type: 'success'
    };
    this.displayDialog = true;
  }

  private loadMockData(): void {
    this.winners = [
      {
        position: 1,
        name: 'Irving Machado',
        amount: 8500,
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        time: '10:45 AM'
      },
      {
        position: 2,
        name: 'Alberto Turcios',
        amount: 9200,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        time: '11:20 AM'
      },
      {
        position: 3,
        name: 'Luis Ramirez',
        amount: 9500,
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        time: '09:15 AM'
      }
    ];
  }

  getMedalColor(position: number): string {
    switch(position) {
      case 1: return '#FFD700'; // Oro
      case 2: return '#C0C0C0'; // Plata
      case 3: return '#CD7F32'; // Bronce
      default: return '#6c757d';
    }
  }

  getMedalIcon(position: number): string {
    switch(position) {
      case 1: return 'pi pi-crown';
      case 2: return 'pi pi-star';
      case 3: return 'pi pi-award';
      default: return 'pi pi-check';
    }
  }
}