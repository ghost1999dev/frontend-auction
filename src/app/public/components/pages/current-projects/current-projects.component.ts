import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/models/projects';
import { WinnerHistoryItem } from 'src/app/core/models/bids';
import { BidService } from 'src/app/core/services/bids.service';

@Component({
  selector: 'app-current-projects',
  templateUrl: './current-projects.component.html',
  styleUrls: ['./current-projects.component.scss']
})
export class CurrentProjectsComponent implements OnInit {
  projects: any[] = [];
  loading: boolean = true;

  constructor(
    private router: Router,
    private bidService: BidService
  ) {}

  ngOnInit(): void {
    this.loadWonProjects();
  }

  loadWonProjects(): void {
    this.loading = true;
    this.bidService.getWinnersHistory().subscribe({
      next: (response: any) => {
        if (response) {
          // Filtrar solo los proyectos donde el usuario actual es el ganador
          const currentUserId = this.id;
          this.projects = response.filter((item: WinnerHistoryItem) => 
            item.winner_id === currentUserId
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading won projects:', error);
        this.loading = false;
      }
    });
  }

  filterTable(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  getSeverity(status: any): any {
    return status === 1 ? 'success' : 'danger';
  }

  navigateToProgress(project: any) {
    this.router.navigate(['/main/project-progress', project.auction.project.id]);
  }

  getStatusText(status: number): string {
    return status === 1 ? 'Activo' : 'Inactivo';
  }

  viewProjectDetails(project: any) {
    // Lógica para ver detalles del proyecto
  }

  editProjectProgress(project: any) {
    // Lógica para editar progreso
  }

  completeProject(project: any) {
    // Lógica para marcar como completado
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