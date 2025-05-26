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

@Component({
  selector: 'app-projects-application',
  templateUrl: './projects-application.component.html',
  styleUrls: ['./projects-application.component.scss']
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

  constructor(
    private applicationsService: ProjectApplicationsService,
    public layoutService: LayoutService,
    public userService: UserService,
    public developerService: DeveloperService,
    private companiesService: CompaniesService,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
  ) { }

  ngOnInit(): void {
    this.getUserById(this.id);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private loadProjectsAndApplications(companyId: number): void {
    forkJoin([
      this.projectsService.getProjectsByCompany(companyId),
      this.applicationsService.getAllApplications()
    ]).subscribe({
      next: ([projects, applications]) => {
        this.projects = projects;
        // Filtrar solo las aplicaciones de los proyectos de esta compañía
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