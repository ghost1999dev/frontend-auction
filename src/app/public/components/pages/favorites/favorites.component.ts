// src/app/views/favorites/favorites.component.ts
import { Component, OnInit } from "@angular/core";
import { LayoutService } from "src/app/core/services/layout.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ProjectsService } from "src/app/core/services/projects.service";
import { DomSanitizer } from "@angular/platform-browser";
import { FavoritesService } from "src/app/core/services/favorites.service";
import { FavoriteProject } from "src/app/core/models/favorites";
import { AuthService } from "src/app/core/auth/auth.service";
import { UserService } from "src/app/core/services/user.service";
import { DeveloperService } from "src/app/core/services/developer.service";
import { finalize } from "rxjs";
import { ProjectApplicationsService } from "src/app/core/services/project-applications.service";

@Component({
  selector: "app-favorites",
  templateUrl: "./favorites.component.html",
  styleUrls: ["./favorites.component.scss"],
})
export class FavoritesComponent implements OnInit {
  favoriteProjects: any[] = [];
  loading = false;
  applications: any[] = [];
  developer: any;
  withdrawReason: string = '';

  // Project dialog properties
  selectedProject: any | null = null;
  displayProjectDialog = false;
  loadingProject = false;
  sanitizedLongDescription: any;
  applyDialogVisible: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private notificationService: NotificationService,
    private developerSrv: DeveloperService,
    private projectsService: ProjectsService,
    private favoritesService: FavoritesService,
    private projectApplicationsService: ProjectApplicationsService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getUserById(this.id);
  }

  loadFavoriteProjects(id: any) {
    this.loading = true;

    this.favoritesService.getAllFavorites(id).subscribe({
      next: (response) => {
        this.favoriteProjects = response.favoriteProjects || [];
        this.loading = false;
        console.log(response)
      },
      error: (error) => {
        this.loading = false;
      },
    });
  }

  removeFromFavorites(favoriteId: number): void {
    this.favoritesService.removeFromFavorites(favoriteId).subscribe({
      next: () => {
        this.favoriteProjects = this.favoriteProjects.filter(
          (project) => project.id !== favoriteId
        );
        this.notificationService.showSuccessCustom(
          "Proyecto eliminado de favoritos"
        );
      },
    });
  }

  showProjectDetails(project: any): void {
    if (!project) return;

    this.loadingProject = true;
    this.displayProjectDialog = true;
    this.selectedProject = project;

    this.sanitizedLongDescription =
      this.selectedProject.long_description ||
      this.selectedProject.full_description ||
      "No hay descripción disponible";

    this.projectsService
      .getProjectById(project.id)
      .pipe(finalize(() => (this.loadingProject = false)))
      .subscribe({
        next: (projectDetails) => {
          this.selectedProject = projectDetails;
          this.sanitizedLongDescription =
            this.sanitizer.bypassSecurityTrustHtml(
              projectDetails.long_description ||
                projectDetails.full_description ||
                "No hay descripción disponible"
            );
        },
        error: () => {
          this.displayProjectDialog = false;
        },
      });
  }

  showApplyDialog(project: any): void {
    this.selectedProject = project;
    this.applyDialogVisible = true;
  }

  confirmApply(): void {
    if (!this.selectedProject || !this.developer) return;

    const applicationData = {
      project_id: this.selectedProject.id,
      developer_id: this.developer.id,
    };

    this.projectApplicationsService.createApplication(applicationData)
      .subscribe({
        next: () => {
          this.notificationService.showSuccessCustom('Has aplicado al proyecto correctamente');
          this.applyDialogVisible = false;
          
          // Actualizar las aplicaciones
          this.projectApplicationsService.getApplicationsByDeveloper(this.developer.id)
            .subscribe({
              next: (apps) => {
                this.applications = apps.filter((app: any) => app.status !== 3);
                // Recargar favoritos para actualizar el estado
                this.loadFavoriteProjects(this.developer.id);
              },
              error: (err) => {
                console.error('Error loading applications:', err);
              }
            });
        }
      });
  }


  getStatusClass(status: number): string {
    const statusClasses: Record<number, string> = {
      0: "status-pending",
      1: "status-accepted",
      2: "status-rejected",
    };
    return statusClasses[status] || "";
  }

  getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      0: "Pendiente",
      1: "Activo",
      2: "Inactivo",
      3: "Rechazado",
      4: "Completado",
    };
    return statusTexts[status] || "Desconocido";
  }

  hasApplied(projectId: number): boolean {
    return (
      this.applications?.some(
        (app) => app.project_id === projectId && app.status !== 3
      ) || false
    );
  }


  loadDeveloper(id: any) {
    this.developerSrv.getDeveloperByIdUser(id).subscribe({
      next: (dev: any) => {
        this.developer = dev; // Guardar la información del desarrollador
        this.loadFavoriteProjects(Number(dev.id));

        this.projectApplicationsService
          .getApplicationsByDeveloper(Number(dev.id))
          .subscribe({
            next: (apps: any) => {
              this.applications = apps.filter((app: any) => app.status !== 3);
            },
            error: (err) => {
              console.error("Error loading applications:", err);
            },
          });
      },
    });
  }


  public getUserById(id: any) {
    this.userService.getUsersById(id).subscribe((next: any) => {
      if (next) {
        if (next.role_id === 2) {
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
      return JSON.parse(payload)["id"];
    } else {
      return null;
    }
  }

  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();
}
