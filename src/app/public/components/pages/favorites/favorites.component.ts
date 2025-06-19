// src/app/views/favorites/favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { FavoriteProject } from 'src/app/core/models/favorites';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteProjects: any[] = [];
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
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadFavoriteProjects(this.id);
  }

  loadFavoriteProjects(id: number): void {
    this.loading = true;
  

    this.favoritesService.getAllFavorites(id).subscribe({
      next: (response) => {
        this.favoriteProjects = response.favoriteProjects || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  removeFromFavorites(favoriteId: number): void {
    this.favoritesService.removeFromFavorites(favoriteId).subscribe({
      next: () => {
        this.favoriteProjects = this.favoriteProjects.filter(project => project.id !== favoriteId);
        this.notificationService.showSuccessCustom('Proyecto eliminado de favoritos');
      }
    });
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
      1: 'Activo',
      2: 'Inactivo',
      3: 'Rechazado',
      4: 'Completado',

    };
    return statusTexts[status] || 'Desconocido';
  }

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        if(next.role_id === 2){
          this.loadFavoriteProjects(next.id)
        }
      }
    })
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