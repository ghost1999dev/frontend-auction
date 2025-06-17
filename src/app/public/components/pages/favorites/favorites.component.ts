import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  savedApplications: any[] = [];
  loading = false;
  
  // Project dialog properties
  selectedProject: any | null = null;
  displayProjectDialog = false;
  loadingProject = false;
  sanitizedLongDescription: any;

  constructor(
    public layoutService: LayoutService,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadSavedApplications();
  }

  loadSavedApplications(): void {
    this.loading = true;
    try {
      const savedApps = JSON.parse(localStorage.getItem('savedApplications') || '[]');
      this.savedApplications = savedApps;
    } catch (error) {
      console.error('Error loading saved applications:', error);
    } finally {
      this.loading = false;
    }
  }

  removeFromFavorites(applicationId: number): void {
    try {
      const savedApps = JSON.parse(localStorage.getItem('savedApplications') || '[]');
      const updatedApps = savedApps.filter((app: any) => app.id !== applicationId);
      localStorage.setItem('savedApplications', JSON.stringify(updatedApps));
      this.savedApplications = updatedApps;
      this.notificationService.showSuccessCustom('Aplicación eliminada de favoritos');
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  showProjectDetails(projectId: number): void {
    if (!projectId) return;

    this.loadingProject = true;
    this.displayProjectDialog = true;
    
    this.projectsService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.selectedProject = project;
        this.sanitizedLongDescription = this.sanitizer.bypassSecurityTrustHtml(
          project.long_description || project.full_description || 'No hay descripción disponible'
        );
        this.loadingProject = false;
      },
      error: () => {
        this.displayProjectDialog = false;
        this.loadingProject = false;
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

  getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      0: 'Pendiente',
      1: 'Activa',
      2: 'Rechazada'
    };
    return statusTexts[status] || 'Desconocido';
  }
}