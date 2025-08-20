import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Project } from 'src/app/core/models/projects';
import { RatingService } from 'src/app/core/services/rating.service';
import { CreateRatingRequest } from 'src/app/core/models/ratings';
import { ProjectTrackingService } from 'src/app/core/services/project-tracking.service';
import { ProjectTracking, ProjectStatus } from 'src/app/core/models/project-tracking';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-project-progress',
  templateUrl: './project-progress.component.html',
  styleUrls: ['./project-progress.component.scss'],
  providers: [MessageService]
})
export class ProjectProgressComponent implements OnInit {
  projectId!: number;
  project!: any;
  activeIndex: number = 0;
  steps: any[] = [
    { label: 'Proyecto Asignado', icon: 'pi pi-search' },
    { label: 'En Progreso', icon: 'pi pi-code' },
    { label: 'En Revisión', icon: 'pi pi-eye' },
    { label: 'Completado', icon: 'pi pi-check-circle' }
  ];
  isCompleted: boolean = false;
  projectStatuses: ProjectStatus;
 trackingHistory: ProjectTracking[] = [];
  allStatusHistory: ProjectTracking[] = []; // Nueva variable para todos los estados
  
  // Rating properties
  displayRatingDialog: boolean = false;
  ratingScore: number = 5;
  ratingComment: string = '';
  isRating: boolean = false;
  hasExistingRating: boolean | any = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private ratingService: RatingService,
    private projectTrackingService: ProjectTrackingService,
    private projectsService: ProjectsService,
    private NotificationSrv: NotificationService
  ) {
    this.projectStatuses = this.projectTrackingService.getProjectStatus();
  }

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject();
    this.loadTrackingHistory();
  }

  loadProject() {
    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (project: Project) => {
        this.project = project;

        this.getPublicRating(project.company_id)
      },
      error: (error) => {
        console.error('Error loading project:', error);
        
        // Intentar cargar desde localStorage como fallback
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
          this.project = JSON.parse(savedProject);
        }
      }
    });
  }

  loadTrackingHistory() {
    this.projectTrackingService.getAllStatus(this.projectId).subscribe({
      next: (response: any) => {
        if (response.success && response.current) {
          this.allStatusHistory = response.current
        
          // Para trackingHistory mantenemos solo el estado más alto (como antes)
          this.trackingHistory = [...this.allStatusHistory];
          this.trackingHistory.sort((a, b) => b.status - a.status);
          
          // Determinar el estado actual
          const highestStatus = this.trackingHistory[0]?.status || 1;
          this.activeIndex = highestStatus - 1;
          
          // Verificar si el proyecto está completado
          this.isCompleted = highestStatus === this.projectStatuses.COMPLETED;
        }
      },
      error: (error) => {
        console.error('Error loading tracking history:', error);
      }
    });
  }

  // Función para mostrar detalles de un estado específico
  showStatusDetails(status: number) {
    const statusInfo = this.trackingHistory.find(item => item.status === status);
    if (statusInfo) {
      this.NotificationSrv.showErrorCustom(statusInfo.notes || 'Sin notas disponibles')
    }
  }

  // Solo disponible cuando el proyecto está completado
  openRatingDialog() {
    this.displayRatingDialog = true;
  }

  submitRating() {
    if (!this.project?.company?.id) return;

    this.isRating = true;
    const ratingData: CreateRatingRequest = {
      company_id: this.project.company.id,
      score: this.ratingScore,
      comment: this.ratingComment,
      isVisible: true
    };

    this.ratingService.createRating(ratingData).subscribe({
      next: () => {
        this.NotificationSrv.showSuccessCustom('Gracias por calificar a la empresa')
        this.displayRatingDialog = false;
        this.resetRatingForm();
      },
      error: (err) => {
        this.NotificationSrv.showErrorCustom('No se pudo enviar la calificación')
      },
      complete: () => {
        this.isRating = false;
      }
    });
  }

    private getPublicRating(id: number) {
    this.ratingService.getAllRatings({ company_id: id }).subscribe({
      next: (company: any) => {
        const hasRating = company.data.some(
          (rating: any) =>
            rating.author_id === this.id && rating.company_id === id
        );
        this.hasExistingRating = hasRating;
      },
      error: (err) => {
        this.NotificationSrv.showErrorCustom(
          "Error al cargar datos del desarrollador"
        );
      },
    });
  }

  private resetRatingForm() {
    this.ratingScore = 5;
    this.ratingComment = '';
  }

  getStatusNotes(status: number): string {
    const statusEntry = this.trackingHistory.find(item => item.status === status);
    return statusEntry?.notes || 'Estado pendiente de aprobación';
  }

  getStatusDate(status: number): string {
    const statusEntry = this.trackingHistory.find(item => item.status === status);
    return statusEntry?.updated_at ? new Date(statusEntry.updated_at).toLocaleDateString() : '';
  }

  hasStatus(status: number): boolean {
    return this.trackingHistory.some(item => item.status === status);
  }

  // Nueva función para obtener la severidad del tag según el estado
  getStatusSeverity(status: any): any {
    switch (status) {
      case this.projectStatuses.ASSIGNED:
        return 'info';
      case this.projectStatuses.IN_PROGRESS:
        return 'warning';
      case this.projectStatuses.IN_REVIEW:
        return 'help';
      case this.projectStatuses.COMPLETED:
        return 'success';
      default:
        return 'info';
    }
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