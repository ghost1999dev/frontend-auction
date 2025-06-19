import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { UserService } from 'src/app/core/services/user.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-history-projects',
  templateUrl: './history-projects.component.html',
  styleUrls: ['./history-projects.component.scss']
})
export class HistoryProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt: Table | undefined;
  
  projects: any[] = [];
  loading = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private projectsService: ProjectsService,
    private developerService: DeveloperService,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProjectsHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadProjectsHistory(): void {
    this.loading = true;
    const userId = this.getUserInfo();
    
    const userSub = this.userService.getUsersById(userId).subscribe({
      next: (user: any) => {
        if (user?.role_id === 2) { // Developer role
          this.loadDeveloperProjects(user.id);
        } else {
          this.loading = false;
          this.notificationService.showErrorCustom('Solo los desarrolladores pueden ver el historial de proyectos');
        }
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(userSub);
  }

  private loadDeveloperProjects(userId: number): void {
    const devSub = this.developerService.getDeveloperByIdUser(userId).subscribe({
      next: (developer) => {
        if (developer?.id) {
          this.getProjectsHistory(developer.id);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(devSub);
  }

  private getProjectsHistory(developerId: number): void {
    const historySub = this.projectsService.getProjectsHistoryByDeveloper(developerId).subscribe({
      next: (projects) => {
        this.projects = projects;
        console.log(projects)
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    
    this.subscriptions.add(historySub);
  }

  getStatusLabel(status: any): any {
    const statusMap: Record<number, string> = {
      0: 'Pendiente',
      1: 'Activo',
      2: 'Inactivo',
      3: 'Rechazado',
      4: 'Finalizado'
    };
    return statusMap[status] || 'Desconocido';
  }

  getStatusSeverity(status: any): any {
    const severityMap: Record<number, string> = {
      0: 'warning',
      1: 'success',
      2: 'danger',
      3: 'danger',
      4: 'info'
    };
    return severityMap[status] || '';
  }

  onGlobalFilter(table: any, event: any): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  private getUserInfo(): string {
    const token = localStorage.getItem("login-token");
    if (!token) return '';
    
    try {
      const payload = token.split(".")[1];
      return JSON.parse(window.atob(payload))['id'] || '';
    } catch (e) {
      console.error('Error parsing token:', e);
      return '';
    }
  }
}