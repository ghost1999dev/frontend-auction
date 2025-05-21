import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectApplicationsService } from 'src/app/core/services/project-applications.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { Application } from 'src/app/core/models/applications_projects';
import { UserService } from 'src/app/core/services/user.service';
import { DeveloperService } from 'src/app/core/services/developer.service';

@Component({
  selector: 'app-projects-application',
  templateUrl: './projects-application.component.html',
  styleUrls: ['./projects-application.component.scss']
})
export class ProjectsApplicationComponent implements OnInit {
  applications: any[] = [];
  loading = false;
  subscription!: Subscription;

  constructor(
    private applicationsService: ProjectApplicationsService,
    public layoutService: LayoutService,
    public userService: UserService,
    public developerService: DeveloperService
  ) { }

  ngOnInit(): void {
    this.loadDeveloper(this.id)
  }


  loadApplications(id: number): void {
    this.loading = true;
    this.applicationsService.getApplicationsByDeveloper(id).subscribe({
      next: (apps: any) => {
        this.applications = apps;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Error is already handled by the service
      }
    });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-accepted';
      case 2: return 'status-rejected';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDeveloper(id: number): void {
    this.loading = true;
    this.developerService.getDeveloperByIdUser(id)
    .subscribe({
      next: (data) => {
        if(data){
          this.loadApplications(Number(data.id))
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading developer:', error);
        this.loading = false;
      }
    });
  }

  getStatusText(status: number): string {
  switch (status) {
    case 0: return 'Pendiente';
    case 1: return 'Activa';
    case 2: return 'Rechazada';
    default: return 'Desconocido';
  }
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
}