import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectApplicationsService } from 'src/app/core/services/project-applications.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { Application } from 'src/app/core/models/applications_projects';
import { UserService } from 'src/app/core/services/user.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-projects-application',
  templateUrl: './projects-application.component.html',
  styleUrls: ['./projects-application.component.scss']
})
export class ProjectsApplicationComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  loading = false;
  subscription!: Subscription;

  public company: any;
  public developer: any;
  projects: any[] = [];

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

  loadApplications(id: number): void {
    this.loading = true;
    this.applicationsService.getApplicationsByDeveloper(id)
    .subscribe({
      next: (apps: any) => {
        this.applications = apps;
        this.filterApplications(); 
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showErrorCustom('Error al cargar aplicaciones');
      }
    });
  }

  loadApplicationsAll(): void {
    this.loading = true;
    this.applicationsService.getAllApplications()
    .subscribe({
      next: (apps: any) => {
        this.applications = apps;
        this.filterApplications(); 
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showErrorCustom('Error al cargar aplicaciones');
      }
    });
  }

  filterApplications(): void {
    if (this.projects.length > 0) {
      this.filteredApplications = this.applications.filter(app => {
        return this.projects.some(project => project.id === app.project_id);
      });
    } else {
      this.filteredApplications = [...this.applications];
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-accepted';
      case 2: return 'status-rejected';
      default: return '';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pendiente';
      case 1: return 'Activa';
      case 2: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  loadDeveloper(id: number): void {
    this.loading = true;
    this.developerService.getDeveloperByIdUser(id)
    .subscribe({
      next: (data) => {
        if(data){
          this.developer = data;
          this.loadApplications(Number(data.id));
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading developer:', error);
        this.loading = false;
      }
    });
  }

  loadCompany(userId: number): void {
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.loadProjects(Number(data.id));
        this.loadApplicationsAll()
        this.company = data;
      },
      error: (error: any) => {
        console.error('Error de carga de la empresa:', error);
      }
    });
  }

  loadProjects(id: any): void {
    this.projectsService.getProjectsByCompany(id)
    .subscribe({
      next: (data: any) => {
        this.projects = data;
        this.filterApplications();
      },
      error: (error: any) => {
        this.notificationService.showErrorCustom('No se pudo cargar proyectos');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public getUserById(id: any) {
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next) {
        if(next.role_id === 1) {
          this.loadCompany(next.id);
        } else if(next.role_id === 2) {
          this.loadDeveloper(next.id);
        }
      }
    });
  }

  getUserInfo() {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)['id'];
    } else {
      return null;
    }
  }
  
  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();


  getStatusSeverity(status: any): any {
    switch(status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'danger';
      default: return 'info';
    }
  }
}