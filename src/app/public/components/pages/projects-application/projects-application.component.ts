import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { ProjectApplicationsService } from 'src/app/core/services/project-applications.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { UserService } from 'src/app/core/services/user.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { Table } from 'primeng/table';
import { RatingService } from 'src/app/core/services/rating.service'; // Añadir esto
import { Rating } from 'src/app/core/models/ratings';
import { ConfirmationService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-projects-application',
  templateUrl: './projects-application.component.html',
  styleUrls: ['./projects-application.component.scss'],
  providers: [ConfirmationService]
})
export class ProjectsApplicationComponent implements OnInit, OnDestroy {
  applications: any[] = [];
  filteredApplications: any[] = [];
  loading = false;
  subscriptions: Subscription = new Subscription();
  
  company: any;
  developer: any;
  projects: any[] = [];
  id: any = this.getUserInfo();

  displayRatingsDialog = false;
  selectedDeveloper: any;
  developerRatings: Rating[] = [];
  averageRating: number = 0;
  totalRatings: number = 0;
  loadingRatings = false;

  displayProjectDialog = false;
  selectedProject: any;
  loadingProject = false;

  displayWithdrawDialog = false;
  selectedApplicationId: number | null = null;
  withdrawLoading = false;

  sanitizedLongDescription: any;
  selectedProjectFilter: any = null;
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
    private sanitizer: DomSanitizer, // Añade esto
    private confirmationService: ConfirmationService // Añade esto
  ) { }

  ngOnInit(): void {
    this.getUserById(this.id);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Modify the loadProjectsAndApplications method
  private loadProjectsAndApplications(companyId: number): void {
    forkJoin([
      this.projectsService.getProjectsByCompany(companyId),
      this.applicationsService.getAllApplications()
    ]).subscribe({
      next: ([projects, applications]) => {
        this.projects = projects;
        // Create project options for dropdown
        this.projectOptions = [
          { label: 'Todos los proyectos', value: null },
          ...projects.map((project: any) => ({
            label: project.project_name,
            value: project.id
          }))
        ];
        
        // Filter applications for this company's projects
        this.applications = applications.filter((app: any) => 
          this.projects.some(project => project.id === app.project_id)
        );
        this.filteredApplications = [...this.applications];
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar proyectos y aplicaciones');
        this.loading = false;
      }
    });
  }

  // Add this method to filter by selected project
  onProjectFilterChange(): void {
    if (!this.selectedProjectFilter) {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(
        app => app.project_id === this.selectedProjectFilter
      );
    }
  }

  showDeveloperRatings(developer: any): void {
    this.selectedDeveloper = developer;
    this.loadingRatings = true;
    this.displayRatingsDialog = true;

    forkJoin([
      this.ratingService.getAverageRatingByDeveloper(developer.id),
      this.ratingService.getAllRatings({ developer_id: developer.id })
    ]).subscribe({
      next: ([averageResponse, ratingsResponse]) => {
        this.averageRating = averageResponse.averageScore;
        this.totalRatings = averageResponse.totalRatings;
        this.developerRatings = ratingsResponse.ratings || [];
        this.loadingRatings = false;
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar los ratings del desarrollador');
        this.loadingRatings = false;
      }
    });
  }

  getStarRating(score: number): string {
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
  }


  private getUserById(id: any): void {
    this.loading = true;
    const userSub = this.userService.getUsersById(id)
      .subscribe({
        next: (user: any) => {
          if (user) {
            if (user.role_id === 1) { // Company
              this.loadCompanyData(user.id);
            } else if (user.role_id === 2) { // Developer
              this.loadDeveloperData(user.id);
            }
          } else {
            this.loading = false;
          }
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar datos del usuario');
          this.loading = false;
        }
      });
    this.subscriptions.add(userSub);
  }

  private loadCompanyData(userId: number): void {
    this.loading = true;
    
    const companySub = this.companiesService.getCompanyByUserId(userId)
      .subscribe({
        next: (company) => {
          this.company = company;
          this.loadProjectsAndApplications(company.id);
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar datos de la empresa');
          this.loading = false;
        }
      });
    
    this.subscriptions.add(companySub);
  }

  private loadDeveloperData(userId: number): void {
    this.loading = true;
    
    const devSub = this.developerService.getDeveloperByIdUser(userId)
      .subscribe({
        next: (developer) => {
          if (developer) {
            this.developer = developer;
            this.loadApplications(Number(developer.id));
          }
          this.loading = false;
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar datos del desarrollador');
          this.loading = false;
        }
      });
    
    this.subscriptions.add(devSub);
  }

  private loadApplications(developerId: number): void {
    this.loading = true;
    const appsSub = this.applicationsService.getApplicationsByDeveloper(developerId)
      .subscribe({
        next: (apps) => {
          this.applications = apps;
          this.filteredApplications = [...this.applications];
          this.loading = false;
        },
        error: (err) => {
          this.notificationService.showErrorCustom('Error al cargar aplicaciones');
          this.loading = false;
        }
      });
    
    this.subscriptions.add(appsSub);
  }

  filterApplications(): void {
    if (this.projects.length > 0) {
      this.filteredApplications = this.applications.filter(app => 
        this.projects.some(project => project.id === app.project_id)
      );
    } else {
      this.filteredApplications = [...this.applications];
    }
  }

  showProjectDetails(projectId: number): void {
    this.loadingProject = true;
    this.displayProjectDialog = true;
    
    this.projectsService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.selectedProject = project;
        // Sanitiza el HTML para seguridad
        this.sanitizedLongDescription = this.sanitizer.bypassSecurityTrustHtml(
          project.long_description || project.full_description || 'No hay descripción disponible'
        );
        this.loadingProject = false;
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al cargar los detalles del proyecto');
        this.loadingProject = false;
        this.displayProjectDialog = false;
      }
    });
  }


  openWithdrawDialog(applicationId: number): void {
    this.selectedApplicationId = applicationId;
    this.displayWithdrawDialog = true;
  }

  confirmWithdraw(): void {
    if (!this.selectedApplicationId) return;
    
    this.withdrawLoading = true;
    this.applicationsService.deleteApplication(this.selectedApplicationId).subscribe({
      next: () => {
        this.notificationService.showSuccessCustom('Aplicación retirada correctamente');
        this.loadApplications(Number(this.developer.id));
        this.displayWithdrawDialog = false;
        this.withdrawLoading = false;
      },
      error: (err) => {
        this.notificationService.showErrorCustom('Error al retirar la aplicación');
        this.withdrawLoading = false;
      }
    });
  }

  getStatusClass(status: number): string {
    const statusClasses: Record<number, string> = {
      0: 'status-pending',
      1: 'status-accepted',
      2: 'status-rejected'
    };
    return statusClasses[status] || '';
  }

  getStatusText(status: any): any {
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

  onGlobalFilter(table: any, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  private getUserInfo(): any {
    const token = this.getTokens();
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = window.atob(payload);
        return JSON.parse(decodedPayload)['id'];
      } catch (e) {
        console.error('Error parsing token:', e);
        return null;
      }
    }
    return null;
  }

  private getTokens(): string | null {
    return localStorage.getItem("login-token");
  }
}