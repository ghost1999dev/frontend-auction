import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProjectApplicationsService } from 'src/app/core/services/project-applications.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { UserService } from 'src/app/core/services/user.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { Table } from 'primeng/table';
import { RatingService } from 'src/app/core/services/rating.service';
import { Rating } from 'src/app/core/models/ratings';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';

interface Application {
  id: number;
  project_id: number;
  project?: {
    project_name: string;
    [key: string]: any;
  };
  developer?: {
    id: number;
    name: string;
    [key: string]: any;
  };
  status: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface Project {
  id: number;
  project_name: string;
  description: string;
  long_description?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-projects-application',
  templateUrl: './projects-application.component.html',
  styleUrls: ['./projects-application.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ProjectsApplicationComponent implements OnInit, OnDestroy {
  applications: any[] = [];
  filteredApplications: Application[] = [];
  loading = false;
  subscriptions: Subscription = new Subscription();
  
  company: any;
  developer: any;
  projects: Project[] = [];
  id: any = this.getUserInfo();

  // Ratings dialog properties
  displayRatingsDialog = false;
  selectedDeveloper: any;
  developerRatings: any[] = [];
  averageRating: number = 0;
  totalRatings: number = 0;
  loadingRatings = false;
  chartData: any;
  chartOptions: any;

  // Project dialog properties
  displayProjectDialog = false;
  selectedProject: any | null = null;
  loadingProject = false;
  sanitizedLongDescription: any;

  // Withdraw dialog properties
  displayWithdrawDialog = false;
  selectedApplicationId: number | null = null;
  withdrawLoading = false;

  // Filter properties
  selectedProjectFilter: number | null = null;
  projectOptions: any[] = [];

  constructor(
    private applicationsService: ProjectApplicationsService,
    public layoutService: LayoutService,
    public userService: UserService,
    public developerService: DeveloperService,
    private companiesService: CompaniesService,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private ratingService: RatingService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getUserById(this.id);
    this.initializeChartOptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Improved method with better typing and error handling
  private getUserById(id: any): void {
    if (!id) {
      this.notificationService.showErrorCustom('No se pudo obtener el ID del usuario');
      return;
    }

    this.loading = true;
    this.subscriptions.add(
      this.userService.getUsersById(id).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (user: any) => {
          if (!user) {
            this.notificationService.showErrorCustom('Usuario no encontrado');
            return;
          }

          if (user.role_id === 1) { // Company
            this.loadCompanyData(user.id);
          } else if (user.role_id === 2) { // Developer
            this.loadDeveloperData(user.id);
          }
        },
        error: (err: any) => {
          this.notificationService.showErrorCustom('Error al cargar datos del usuario'+err.message);
        }
      })
    );
  }

  private loadCompanyData(userId: number): void {
    this.loading = true;
    this.subscriptions.add(
      this.companiesService.getCompanyByUserId(userId).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (company) => {
          this.company = company;
          this.loadProjectsAndApplications(company.id);
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar datos de la empresa'+err.message);
        }
      })
    );
  }

  private loadDeveloperData(userId: number): void {
    this.loading = true;
    this.subscriptions.add(
      this.developerService.getDeveloperByIdUser(userId).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (developer) => {
          this.developer = developer;
          if (developer) {
            this.loadApplications(Number(developer.id));
          }
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar datos del desarrollador'+err.message);
        }
      })
    );
  }

  private loadProjectsAndApplications(companyId: number): void {
    this.loading = true;
    this.subscriptions.add(
      forkJoin([
        this.projectsService.getProjectsByCompany(companyId),
        this.applicationsService.getAllApplications()
      ]).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: ([projects, applications]) => {
          this.projects = projects;
          this.projectOptions = [
            { label: 'Todos los proyectos', value: null },
            ...projects.map((project: Project) => ({
              label: project.project_name,
              value: project.id
            }))
          ];
          
          this.applications = applications.filter((app: any) => 
            this.projects.some(project => project.id === app.project_id)
          );
          this.filteredApplications = [...this.applications];
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar proyectos y aplicaciones'+ err.message);
        }
      })
    );
  }

  private loadApplications(developerId: number): void {
    this.loading = true;
    this.subscriptions.add(
      this.applicationsService.getApplicationsByDeveloper(developerId).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (apps) => {
          this.applications = apps;
          this.filteredApplications = [...this.applications];
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar aplicaciones'+ err.message);
        }
      })
    );
  }

  showDeveloperRatings(developer: any): void {
    if (!developer || !developer.id) {
      this.notificationService.showErrorCustom('Desarrollador no válido');
      return;
    }

    this.selectedDeveloper = developer;
    this.loadingRatings = true;
    this.displayRatingsDialog = true;

    this.subscriptions.add(
      forkJoin([
        this.ratingService.getAverageRatingByDeveloper(developer.id),
        this.ratingService.getAllRatings({ developer_id: developer.id })
      ]).pipe(
        finalize(() => this.loadingRatings = false)
      ).subscribe({
        next: ([averageResponse, ratingsResponse]: any) => {
          this.averageRating = averageResponse.averageScore;
          this.totalRatings = averageResponse.totalRatings || 0;
          this.developerRatings = ratingsResponse.data || [];
          console.log(this.averageRating)
          console.log(this.totalRatings)
          console.log(this.developerRatings)

          this.updateChartData();
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar los ratings del desarrollador'+err.message);
        }
      })
    );
  }

  private initializeChartOptions(): void {
    const isDark = this.layoutService.config.colorScheme === 'dark';
    const textColor = isDark ? '#e0e0e0' : '#495057';
    const surfaceBorder = isDark ? '#4a4a4a' : '#dfe7ef';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#3e4858' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: surfaceBorder,
          borderWidth: 1,
          padding: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { weight: 500 } },
          grid: { color: gridColor, drawBorder: false }
        },
        y: {
          ticks: { 
            color: textColor, 
            font: { weight: 500 },
            stepSize: 1,
            precision: 0
          },
          grid: { color: gridColor, drawBorder: false },
          beginAtZero: true
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    };
  }

  private updateChartData(): void {
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    this.developerRatings.forEach((rating: any) => {
      const score = Math.round(rating.score);
      distribution[score.toString() as keyof typeof distribution]++;
    });

    const isDark = this.layoutService.config.colorScheme === 'dark';

    this.chartData = {
      labels: ['1 estrella', '2 estrellas', '3 estrellas', '4 estrellas', '5 estrellas'],
      datasets: [{
        label: 'Distribución de Ratings',
        backgroundColor: isDark ? [
          'rgba(110, 142, 251, 0.7)',
          'rgba(110, 142, 251, 0.8)',
          'rgba(110, 142, 251, 0.9)',
          'rgba(110, 142, 251, 1.0)',
          'rgba(167, 119, 227, 1.0)'
        ] : [
          'rgba(66, 165, 245, 0.7)',
          'rgba(66, 165, 245, 0.8)',
          'rgba(66, 165, 245, 0.9)',
          'rgba(66, 165, 245, 1.0)',
          'rgba(126, 87, 194, 1.0)'
        ],
        borderColor: isDark ? '#4a4a4a' : '#dfe7ef',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: isDark ? [
          'rgba(110, 142, 251, 0.9)',
          'rgba(110, 142, 251, 1.0)',
          'rgba(110, 142, 251, 1.1)',
          'rgba(110, 142, 251, 1.2)',
          'rgba(167, 119, 227, 1.2)'
        ] : [
          'rgba(66, 165, 245, 0.9)',
          'rgba(66, 165, 245, 1.0)',
          'rgba(66, 165, 245, 1.1)',
          'rgba(66, 165, 245, 1.2)',
          'rgba(126, 87, 194, 1.2)'
        ],
        data: [
          distribution['1'] || 0,
          distribution['2'] || 0,
          distribution['3'] || 0,
          distribution['4'] || 0,
          distribution['5'] || 0
        ]
      }]
    };
  }

  showProjectDetails(projectId: number): void {
    if (!projectId) return;

    this.loadingProject = true;
    this.displayProjectDialog = true;
    
    this.subscriptions.add(
      this.projectsService.getProjectById(projectId).pipe(
        finalize(() => this.loadingProject = false)
      ).subscribe({
        next: (project) => {
          this.selectedProject = project;
          this.sanitizedLongDescription = this.sanitizer.bypassSecurityTrustHtml(
            project.long_description || project.full_description || 'No hay descripción disponible'
          );
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar los detalles del proyecto'+err.message);
          this.displayProjectDialog = false;
        }
      })
    );
  }

  openWithdrawDialog(applicationId: number): void {
    this.selectedApplicationId = applicationId;
    this.displayWithdrawDialog = true;
  }

  confirmWithdraw(): void {
    if (!this.selectedApplicationId || !this.developer) return;
    
    this.withdrawLoading = true;
    this.subscriptions.add(
      this.applicationsService.deleteApplication(this.selectedApplicationId).pipe(
        finalize(() => this.withdrawLoading = false)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccessCustom('Aplicación retirada correctamente');
          this.loadApplications(Number(this.developer.id));
          this.displayWithdrawDialog = false;
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al retirar la aplicación'+err.message);
        }
      })
    );
  }

  onProjectFilterChange(): void {
    if (!this.selectedProjectFilter) {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(
        app => app.project_id === this.selectedProjectFilter
      );
    }
  }

  getStatusClass(status: number): string {
    const statusClasses: Record<number, string> = {
      0: 'status-pending',
      1: 'status-accepted',
      2: 'status-rejected'
    };
    return statusClasses[status] || '';
  }

  getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      0: 'Pendiente',
      1: 'Activa',
      2: 'Rechazada'
    };
    return statusTexts[status] || 'Desconocido';
  }

  getStatusSeverity(status: any): any {
    const severityMap: Record<number, string> = {
      0: 'warning',
      1: 'success',
      2: 'danger'
    };
    return severityMap[status] || 'info';
  }

  getStarRating(score: number): string {
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
  }

  getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F06292', '#7986CB', '#9575CD'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  private getUserInfo(): any {
    const token = this.getTokens();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decodedPayload = window.atob(payload);
      return JSON.parse(decodedPayload)['id'];
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  private getTokens(): string | null {
    return localStorage.getItem("login-token");
  }

  saveApplicationToLocalStorage(application: any): void {
    if (!application) return;

    // Obtener aplicaciones guardadas actualmente o inicializar array vacío
    const savedApplications = JSON.parse(localStorage.getItem('savedApplications') || '[]');

    // Verificar si la aplicación ya está guardada
    const isAlreadySaved = savedApplications.some((app: any) => app.id === application.id);
    
    if (isAlreadySaved) {
      this.notificationService.showSuccessCustom('Esta aplicación ya está guardada en tus marcadores');
      return;
    }

    // Agregar la nueva aplicación
    savedApplications.push(application);
    
    // Guardar en localStorage
    localStorage.setItem('savedApplications', JSON.stringify(savedApplications));
    
    this.notificationService.showSuccessCustom('Aplicación guardada en marcadores');
  }
}