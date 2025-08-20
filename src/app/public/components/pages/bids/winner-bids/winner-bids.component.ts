import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import confetti from "canvas-confetti";
import { finalize } from "rxjs/operators";
import {
  AuctionResultsResponse,
  AuctionResults,
  Bid,
} from "src/app/core/models/bids";
import { BidService } from "src/app/core/services/bids.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ProjectTrackingService } from "src/app/core/services/project-tracking.service";
import { RatingService } from "src/app/core/services/rating.service";
import { DeveloperService } from "src/app/core/services/developer.service";
import { AuctionService } from "src/app/core/services/auction.service";

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
}

interface ProjectDetails {
  project_name: string;
  description: string;
  budget: number;
  company?: {
    name: string;
  };
}

interface TimelineEvent {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

type ProjectStatus =
  | "not_assigned"
  | "assigned"
  | "in_progress"
  | "review"
  | "completed";

interface DialogConfig {
  header: string;
  message: string;
  type: "info" | "confirm" | "rating" | "success" | "notes";
  winner?: Winner;
  projectId?: number;
  nextStatus?: ProjectStatus;
}

@Component({
  selector: "app-winner-bids",
  templateUrl: "./winner-bids.component.html",
  styleUrls: ["./winner-bids.component.scss"],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class WinnerBidsComponent implements OnInit {
  winners: Winner[] = [
    {
      id: 0,
      position: 1,
      name: "Cargando...",
      amount: 0,
      avatar: "",
      time: "",
      developer_id: 0,
      status: "",
    },
    {
      id: 0,
      position: 2,
      name: "Cargando...",
      amount: 0,
      avatar: "",
      time: "",
      developer_id: 0,
      status: "",
    },
    {
      id: 0,
      position: 3,
      name: "Cargando...",
      amount: 0,
      avatar: "",
      time: "",
      developer_id: 0,
      status: "",
    },
  ];

  auctionId: number = 0;
  auctionName: string = "Cargando...";
  auctionDescription: string = "Cargando detalles...";
  initialBudget: number = 0;
  totalBids: number = 0;
  selectedWinner: any | null = null;
  rating: number = 0;
  comment: string = "";
  isLoading: boolean = true;
  isSelectingWinner: boolean = false;
  projectDetails: any | null = null;
  allBids: Bid[] = [];
  timelineEvents: TimelineEvent[] = [];
  id_developer: number | any;
  user_id: number | any;
  hasExistingRating: boolean | any = false;

  displayConfirmationDialog: boolean = false;
  selectedWinnerToConfirm: any | null = null;

  dialogConfig: any = {
    header: "",
    message: "",
    type: "info",
  };

  displayDialog: boolean = false;
  private storageKey: string;

  projectStatus: ProjectStatus = "not_assigned";
  projectDates = {
    assigned: new Date(),
    started: new Date(),
    delivered: new Date(),
    completed: new Date(),
  };
  projectId: number | any;

  constructor(
    private route: ActivatedRoute,
    private bidService: BidService,
    private notificationService: NotificationService,
    private projectTrackingService: ProjectTrackingService,
    private ratingService: RatingService,
    private messageService: MessageService,
    private developerService: DeveloperService,
    private AuctionSrv: AuctionService,
  ) {
    this.storageKey = `selectedWinner_${this.auctionId}`;
  }

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.params["id"] || 0;
    if (!this.auctionId) {
      this.notificationService.showErrorCustom(
        "No se proporcionó un ID de subasta válido"
      );
      return;
    }

    this.storageKey = `selectedWinner_${this.auctionId}`;
    this.loadSelectedWinner();
    this.loadAuctionResults();
    this.loadProjectStatus();
  }

  // Métodos para manejar la selección del ganador
  selectWinner(winner: Winner): void {
    if (winner.status !== "Ganador") {
      this.notificationService.showErrorCustom(
        "Solo puedes seleccionar un ganador oficial de la subasta"
      );
      return;
    }

    this.selectedWinnerToConfirm = winner;
    this.displayConfirmationDialog = true;
  }

  confirmSelection(): void {
    if (this.selectedWinnerToConfirm) {
      this.showNotesDialogForAssignment();
      this.displayConfirmationDialog = false;
    }
  }

  private showNotesDialogForAssignment(): void {
    this.dialogConfig = {
      header: "Asignar Proyecto",
      message: "Agrega notas para el desarrollador (opcional)",
      type: "notes",
      winner: this.selectedWinnerToConfirm,
      projectId: this.auctionId,
      nextStatus: "assigned",
    };
    this.displayDialog = true;
    this.comment = "";
  }

  // Métodos para manejar el diálogo
  onDialogConfirm(confirmed: boolean): void {
    if (!confirmed) {
      this.displayDialog = false;
      return;
    }

    switch (this.dialogConfig.type) {
      case "notes":
        this.handleProjectTracking();
        break;

      case "rating":
        this.submitRating();
        break;
    }

    this.displayDialog = false;
  }

  private handleProjectTracking(): void {
    if (!this.dialogConfig.projectId || !this.dialogConfig.nextStatus) return;

    const trackingData = {
      project_id: this.projectId,
      status: this.getStatusNumber(this.dialogConfig.nextStatus),
      notes: this.comment,
    };

    this.isSelectingWinner = true;

    if (
      this.dialogConfig.nextStatus === "assigned" &&
      this.dialogConfig.winner
    ) {
      this.selectedWinner = this.dialogConfig.winner;
      this.saveSelectedWinner();
      this.getDevByIdUser();

      // También notificar al backend sobre el ganador
      this.bidService
        .chooseWinner({
          auction_id: this.auctionId,
          winner_bid: this.selectedWinner.id,
        })
        .subscribe({
          next: (bidResponse) => {
            this.notificationService.showSuccessCustom(
              bidResponse.message || "Ganador seleccionado correctamente"
            );
            this.projectStatus = "assigned";
            this.saveProjectStatus();

            this.dialogConfig.nextStatus === "assigned";
          },
          error: (bidError) => {
            console.error("Error selecting winner:", bidError);
          },
        });
    } else {
      this.projectTrackingService.createTracking(trackingData).subscribe({
        next: (response) => {
          this.notificationService.showSuccessCustom(
            response.message || "Estado del proyecto actualizado"
          );

          // Actualizar estado local
          if (this.dialogConfig.nextStatus) {
            this.projectStatus = this.dialogConfig.nextStatus;
            this.saveProjectStatus();
          }
        },
        error: (error) => {
          console.error("Error updating project status:", error);
          this.notificationService.showErrorCustom(
            error.error?.message || "Error al actualizar el estado del proyecto"
          );
        },
        complete: () => {
          this.isSelectingWinner = false;
        },
      });
    }
  }

  // Métodos para cambiar estados del proyecto con diálogo de notas
  updateProjectStatus(newStatus: ProjectStatus): void {
    if (newStatus === "not_assigned") return;

    this.dialogConfig = {
      header: this.getStatusHeader(newStatus),
      message: this.getStatusMessage(newStatus),
      type: "notes",
      projectId: this.auctionId,
      nextStatus: newStatus,
    };

    this.displayDialog = true;
    this.comment = "";
  }

  private getStatusNumber(status: ProjectStatus): number {
    const statusMap = this.projectTrackingService.getProjectStatus();
    switch (status) {
      case "assigned":
        return statusMap.ASSIGNED;
      case "in_progress":
        return statusMap.IN_PROGRESS;
      case "review":
        return statusMap.IN_REVIEW;
      case "completed":
        return statusMap.COMPLETED;
      default:
        return statusMap.ASSIGNED;
    }
  }

  private getStatusHeader(status: ProjectStatus): string {
    switch (status) {
      case "assigned":
        return "Asignar Proyecto";
      case "in_progress":
        return "Iniciar Proyecto";
      case "review":
        return "Enviar para Revisión";
      case "completed":
        return "Completar Proyecto";
      default:
        return "Actualizar Estado";
    }
  }

  private getStatusMessage(status: ProjectStatus): string {
    switch (status) {
      case "assigned":
        return "Agrega notas para el desarrollador (opcional)";
      case "in_progress":
        return "Agrega comentarios sobre el inicio del proyecto (opcional)";
      case "review":
        return "Agrega comentarios sobre lo entregado (opcional)";
      case "completed":
        return "Agrega comentarios finales sobre el proyecto (opcional)";
      default:
        return "Agrega notas para este cambio de estado (opcional)";
    }
  }

  // Métodos para calificación
  rateDeveloper(): void {
    if (!this.selectedWinner) return;

    this.dialogConfig = {
      header: "Calificar desarrollador",
      message: `Califica a ${this.selectedWinner.name}`,
      type: "rating",
      winner: this.selectedWinner,
    };

    this.displayDialog = true;
    this.rating = 0;
    this.comment = "";
  }

  private submitRating(): void {
    if (!this.selectedWinner || !this.rating) return;

    const ratingData = {
      developer_id: this.id_developer,
      score: this.rating,
      comment: this.comment,
      isVisible: true,
    };

    this.ratingService.createRating(ratingData).subscribe({
      next: (rating) => {
        this.notificationService.showSuccessCustom(
          `Has calificado correctamente al desarrollador`
        );

        // Limpiar selección después de calificar
        this.projectStatus = "completed";
        this.saveProjectStatus();
        this.hasExistingRating = true;
      },
      error: (error) => {
        console.error("Error creating rating:", error);
        this.notificationService.showErrorCustom(
          "Error al enviar la calificación"
        );
      },
    });
  }

  // Métodos de persistencia
  private saveSelectedWinner(): void {
    if (this.selectedWinner) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.selectedWinner)
      );
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  private loadSelectedWinner(): void {
    const savedWinner = localStorage.getItem(this.storageKey);
    if (savedWinner) {
      this.selectedWinner = JSON.parse(savedWinner);
      this.projectStatus = "assigned";
    }
  }

  private saveProjectStatus(): void {
    localStorage.setItem(`projectStatus_${this.auctionId}`, this.projectStatus);
  }

  private loadProjectStatus(): void {
    const savedStatus = localStorage.getItem(`projectStatus_${this.auctionId}`);
    if (savedStatus && this.isValidProjectStatus(savedStatus)) {
      this.projectStatus = savedStatus as ProjectStatus;
    }

    // Actualiza fechas (esto es solo para demostración)
    const now = new Date();
    this.projectDates = {
      assigned: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
      started: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
      delivered: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
      completed: new Date(),
    };
  }

  private isValidProjectStatus(status: string): status is ProjectStatus {
    return [
      "not_assigned",
      "assigned",
      "in_progress",
      "review",
      "completed",
    ].includes(status);
  }

  private loadAuctionResults(): void {
    this.isLoading = true;
    this.bidService
      .getAuctionResults(this.auctionId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          this.getAuctionById(response.data[0].auction_id)
          this.processResults(response.data);
          this.fireConfetti();
          this.loadAuctionDetails();
        },
        error: (error) => {
          console.error("Error loading auction results:", error);
          this.notificationService.showErrorCustom(
            "No se pudieron cargar los resultados de la subasta"
          );
        },
      });
  }

  public getAuctionById(id: any){
    this.AuctionSrv.getAuctionById(id)
    .subscribe((next: any) => {
      this.projectId = next.project_id;
    })
  }

  private loadAuctionDetails(): void {
    this.bidService.listBidsByAuction(this.auctionId).subscribe({
      next: (response: any) => {
        if (response) {
          this.allBids = Array.isArray(response.data)
            ? response.data
            : [response.data];

          const firstBid = this.allBids[0];
          if (firstBid?.auction?.project) {
            this.projectDetails = {
              project_name: firstBid.auction.project.project_name,
              description: firstBid.auction.project.description,
              budget: firstBid.auction.project.budget || 0,
              company: firstBid.auction.project.company,
            };

            this.auctionName = this.projectDetails.project_name;
            this.auctionDescription = this.projectDetails.description;
            this.initialBudget = this.projectDetails.budget;
            this.totalBids = this.allBids.length;

            // Generar eventos de timeline basados en las bids
            this.generateTimelineEvents();
          }
        }
      },
      error: (error) => {
        console.error("Error loading auction details:", error);
      },
    });
  }

  private generateTimelineEvents(): void {
    if (!this.allBids || this.allBids.length === 0) return;

    // Ordenar bids por fecha de creación
    const sortedBids = [...this.allBids].sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    this.timelineEvents = [
      {
        title: "Subasta iniciada",
        description: "La subasta fue abierta para recibir ofertas",
        time: this.formatDate(sortedBids[0].auction?.bidding_started_at),
        icon: "pi pi-check",
        color: "primary",
      },
      {
        title: "Primera oferta recibida",
        description: `${sortedBids[0].developer_profile?.user?.name} hizo la primera oferta`,
        time: this.formatDate(sortedBids[0].createdAt),
        icon: "pi pi-check",
        color: "success",
      },
      {
        title: "Oferta más baja alcanzada",
        description: `Oferta más baja: ${this.winners[0]?.amount} por ${this.winners[0]?.name}`,
        time: this.formatDate(sortedBids[sortedBids.length - 1].createdAt),
        icon: "pi pi-check",
        color: "warning",
      },
      {
        title: "Subasta finalizada",
        description: "La subasta ha sido cerrada con éxito",
        time: this.formatDate(sortedBids[0].auction?.bidding_deadline),
        icon: "pi pi-flag",
        color: "danger",
      },
    ];
  }

  private getDevByIdUser() {
    this.developerService
      .getDeveloperByIdUser(this.selectedWinner.developer_id)
      .subscribe({
        next: (developer) => {
          this.user_id = developer.user_id;
          this.id_developer = developer.id;
          this.getPublicRating(developer.id);
        },
        error: (err) => {
          this.notificationService.showErrorCustom(
            "Error al cargar datos del desarrollador"
          );
        },
      });
  }

  private getPublicRating(id: number) {
    this.ratingService.getAllRatings({ developer_id: id }).subscribe({
      next: (developer: any) => {
        const hasRating = developer.data.some(
          (rating: any) =>
            rating.author_id === this.id && rating.developer_id === id
        );

        this.hasExistingRating = hasRating;
      },
      error: (err) => {
        this.notificationService.showErrorCustom(
          "Error al cargar datos del desarrollador"
        );
      },
    });
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) return "--:-- --";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private processResults(results: AuctionResults[]): void {
    if (!results || results.length === 0) {
      this.winners = [
        {
          id: 0,
          position: 1,
          name: "No hay ganadores",
          amount: 0,
          avatar: this.getRandomAvatar(),
          time: "--:-- --",
          developer_id: 0,
          status: "No disponible",
        },
        {
          id: 0,
          position: 2,
          name: "No hay ganadores",
          amount: 0,
          avatar: this.getRandomAvatar(),
          time: "--:-- --",
          developer_id: 0,
          status: "No disponible",
        },
        {
          id: 0,
          position: 3,
          name: "No hay ganadores",
          amount: 0,
          avatar: this.getRandomAvatar(),
          time: "--:-- --",
          developer_id: 0,
          status: "No disponible",
        },
      ];
      return;
    }

    // Ordenar por amount (ascendente para subasta inversa)
    const sortedResults = [...results].sort((a, b) => a.amount - b.amount);

    // Filtrar solo las pujas ganadoras (status = WINNER)
    const winningBids = sortedResults.filter((bid) => bid.status === "Ganador");

    // Mapear a la estructura de Winner
    this.winners = winningBids.slice(0, 3).map((result: any, index) => ({
      id: result.id,
      position: index + 1,
      name:
        result.developer_profile?.user?.name || "Desarrollador " + (index + 1),
      amount: result.amount,
      avatar: result.developer_profile?.user?.image,
      time: new Date(result.createdAt).toLocaleTimeString(),
      developer_id: result.developer_id,
      status: result.status,
      email: result.developer_profile?.user?.email,
    }));

    // Si hay menos de 3 resultados ganadores, completar con placeholders
    while (this.winners.length < 3) {
      this.winners.push({
        id: 0,
        position: this.winners.length + 1,
        name: "No disponible",
        amount: 0,
        avatar: this.getRandomAvatar(),
        time: "--:-- --",
        developer_id: 0,
        status: "No disponible",
      });
    }
  }

  private getRandomAvatar(): string {
    const avatars = [
      "default-user.jpg",
      "default-user.jpg",
      "default-user.jpg",
    ];
    return `assets/images/${
      avatars[Math.floor(Math.random() * avatars.length)]
    }`;
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
      colors: [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
        "#FF8000",
        "#FF0080",
        "#00FF80",
        "#FFFFFF",
      ],
      scalar: 1.3,
      shapes: ["circle", "square"],
      disableForReducedMotion: true,
    };

    const fire = (
      particleRatio: number,
      opts: Partial<confetti.Options> = {}
    ) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
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
        origin: { x: 0, y: 0.7 },
      });

      confetti({
        ...defaults,
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });
    }, 800);

    setTimeout(() => {
      fire(0.2, {
        spread: 100,
        startVelocity: 25,
        decay: 0.98,
        ticks: 500,
        gravity: 0.2,
        scalar: 1.8,
      });
      setTimeout(() => {
        fire(0.1, {
          spread: 200,
          startVelocity: 20,
          decay: 0.99,
          ticks: 600,
          gravity: 0.1,
          scalar: 2.0,
        });
      }, 500);
    }, 1800);
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
