import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { Project, UpdateProject } from 'src/app/core/models/projects';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectApplicationsService } from 'src/app/core/services/project-applications.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { UserService } from 'src/app/core/services/user.service';
import { finalize, switchMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { RatingService } from 'src/app/core/services/rating.service';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  public company: any;
  public company_id!: number;
  public developer: any;

  applyDialogVisible: boolean = false;
  selectedProject: any = null;

  projects: any[] = [];
  selectedProjects: Project[] = [];
  applications: any[] = [];
  project: Project = {} as Project;
  public isRepublishing: any;

  displayCompanyRatingsDialog = false;
  companyRatingData: any | null = null;
  selectedCompany: any;
  loadingRatings = false;
  chartData: any;
  chartOptions: any

  projectDialog: boolean = false;
  deleteProjectDialog: boolean = false;
  deleteProjectsDialog: boolean = false;

  submitted: boolean = false;
  statuses: any[] = [
    { label: 'Activo', value: 1 },
    { label: 'Inactivo', value: 0 }
  ];

  // Project dialog properties
  displayProjectDialog = false;
  //selectedProject: any | null = null;
  loadingProject = false;
  sanitizedLongDescription: any;

  // Filtering and pagination
  filteredProjects: any[] = [];
  searchTerm: string = '';
  selectedStatus: number | 1 | null = null ;
  selectedSort: string = 'newest';

  showAddEditDialog: boolean = false;
  currentProjectId?: number;
  
  // Pagination
  page: number = 1;
  pageSize: number = 6;
  first: number = 0;
  
  // Options
  statusOptions = [
    { label: 'Pendiente', value: 0 },
    { label: 'Activo', value: 1 },
    { label: 'Inactivo', value: 2 },
    { label: 'Rechazado', value: 3 },
    { label: 'Completado', value: 4 },
    //{ label: 'Republicado', value: 5 }
  ];

  public statusMap: any = {
    0: { label: 'Pendiente', severity: 'warning' },
    1: { label: 'Activo', severity: 'success' },
    2: { label: 'Inactivo', severity: 'danger' },
    3: { label: 'Rechazado', severity: 'danger' },
    4: { label: 'Completado', severity: 'info' }
  };
  
  sortOptions: any[] = [
    { label: 'Más nuevo primero', value: 'newest' },
    { label: 'Más antiguo primero', value: 'oldest' },
    { label: 'Presupuesto mas alto', value: 'highest' },
    { label: 'Presupuesto mas bajo', value: 'lowest' }
  ];

  constructor(
    private projectApplicationsService: ProjectApplicationsService,
    private projectsService: ProjectsService,
    private userService: UserService,
    private notificationServices: NotificationService,
    private developerService: DeveloperService,
    private companiesService: CompaniesService,
    private sanitizer: DomSanitizer,
    private ratingService: RatingService,
    public layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
    this.getUserById(this.id)
    this.filteredProjects = [...this.projects];
    this.initializeChartOptions()
  }

  loadCompany(userId: number): void {
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.company = data;
        this.loadProjects(data.id)
      },
      error: (error: any) => {
        console.error('Error de carga de la empresa:', error);
      }
    });
  }

  // Añade este método para mostrar el diálogo
showApplyDialog(project: any): void {
    this.selectedProject = project;
    this.applyDialogVisible = true;
}

showProjectDetails(project: any): void {
  if (!project) return;

  this.loadingProject = true;
  this.displayProjectDialog = true;
  this.selectedProject = project;
  
  this.sanitizedLongDescription = this.selectedProject.long_description || 
                                 this.selectedProject.full_description || 
                                 'No hay descripción disponible';

  this.projectsService.getProjectById(project.id).pipe(
    finalize(() => this.loadingProject = false)
  ).subscribe({
    next: (projectDetails) => {
      this.selectedProject = projectDetails;
      this.sanitizedLongDescription = this.sanitizer.bypassSecurityTrustHtml(
        projectDetails.long_description || projectDetails.full_description || 'No hay descripción disponible'
      );
    },
    error: () => {
      this.displayProjectDialog = false;
    }
  });
}

formatDate(isoDate: string, locale: string = 'es-ES'): string {
    const date = new Date(isoDate);
    
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
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
            this.notificationServices.showSuccessCustom('Has aplicado al proyecto correctamente');
            this.applyDialogVisible = false;
            
            // 1. Actualizar las aplicaciones primero
            this.projectApplicationsService.getApplicationsByDeveloper(this.developer.id)
                .subscribe({
                    next: (apps) => {
                        this.applications = apps;
                        
                        // 2. Volver a cargar todos los proyectos
                        this.projectsService.getAllProjects()
                            .subscribe({
                                next: (projects) => {
                                    this.projects = projects.filter(p => p.status === 1);
                                    
                                    // 3. Aplicar filtros nuevamente
                                    this.filterProjects();
                                    this.selectedProject = null;
                                },
                                error: (err) => {
                                    console.error('Error loading projects:', err);
                                }
                            });
                    },
                    error: (err) => {
                        console.error('Error loading applications:', err);
                    }
                });
        },
        error: (err) => {
            this.notificationServices.showErrorCustom('Error al aplicar al proyecto');
            console.error('Error applying to project:', err);
        }
    });
}

loadApplications(id: number): void {
  this.projectApplicationsService.getApplicationsByDeveloper(id).subscribe({
    next: (apps: any) => {
      // Filtra las aplicaciones con estado diferente de 3 (Rechazado)
      this.applications = apps.filter((app: any) => app.status !== 3);
      this.filterProjects(); // Vuelve a filtrar cuando se cargan las aplicaciones
    },
    error: (err) => {
      console.error('Error de carga del application Projects:', err);
    }
  });
}

showCompanyRatings(company: any): void {
  if (!company || !company.id) {
    this.notificationServices.showErrorCustom('Compañía no válida');
    return;
  }

  this.selectedCompany = company;
  this.loadingRatings = true;
  this.displayCompanyRatingsDialog = true;

  this.ratingService.getAverageRatingByCompany(company.id).subscribe({
    next: (response: any) => {
      this.companyRatingData = {
        ratingSummary: {
          averageScore: response?.averageScore || 0,
          totalRatings: response?.totalRatings || 0,
          scoreDistribution: this.calculateScoreDistribution(response.ratings || [])
        },
        recentRatings: (response.ratings || []).map((rating: any) => ({
          score: rating.score,
          comment: rating.comment,
          createdAt: rating.createdAt,
          developer_name: rating.author_name || 'Desarrollador'
        }))
      };
      
      this.updateChartData();
      this.loadingRatings = false;
    },
    error: () => {
      this.loadingRatings = false;
      this.companyRatingData = this.getDefaultRatings();
      this.updateChartData();
    }
  });
}

private calculateScoreDistribution(ratings: any[]): any {
  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  ratings.forEach(rating => {
    const score = Math.round(rating.score);
    distribution[score.toString() as keyof typeof distribution]++;
  });
  return distribution;
}

private getDefaultRatings(): any {
  return {
    ratingSummary: {
      averageScore: 0,
      totalRatings: 0,
      scoreDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    },
    recentRatings: []
  };
}

private updateChartData(): void {
  if (!this.companyRatingData) {
    this.companyRatingData = this.getDefaultRatings();
  }

  const distribution = this.companyRatingData.ratingSummary.scoreDistribution;
  const isDark = document.body.classList.contains('dark-theme');

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
      borderColor: isDark ? '#4a4a4a' : '#fff',
      borderWidth: 1,
      borderRadius: 6,
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

getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F06292', '#7986CB', '#9575CD'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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

filterProjects() {
    if (!this.projects || !this.applications) return;

    console.log('Filtering projects...'); // Debug
    console.log('Current applications:', this.applications); // Debug

    this.filteredProjects = this.projects.filter(project => {
        const alreadyApplied = this.applications.some(app => app.project_id === project.id);
        
        const matchesSearch = !this.searchTerm || 
            project.project_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (project.company?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
            (project.category?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()));

        const hasRemainingDays = project.days_remaining >= 1; // Nueva validación    

        const hasAvailableDays = project.days_available >= 1; // Nueva validación
        
        const matchesStatus = this.developer ? project.status === 1 : 
                            (this.selectedStatus === null || project.status === this.selectedStatus);
        
        const shouldShow = this.developer ? !alreadyApplied : true;
        
        return matchesSearch && matchesStatus && shouldShow && hasAvailableDays && hasRemainingDays;
    });

    console.log('Filtered projects:', this.filteredProjects); // Debug
    
    this.sortProjects();
    this.page = 1;
    this.first = 0;
}

loadDeveloper(id: number): void {
  this.developerService.getDeveloperByIdUser(id)
  .subscribe({
    next: (data: any) => {
      this.developer = data;
      // Cargar aplicaciones primero
      this.projectApplicationsService.getApplicationsByDeveloper(Number(data.id)).subscribe({
        next: (apps: any) => {
          // Filtra las aplicaciones con estado diferente de 3 (Rechazado)
          this.applications = apps.filter((app: any) => app.status !== 3);
          // Luego cargar proyectos y aplicar filtros
          this.loadAllProjects();
        },
        error: (err) => {
          console.error('Error loading applications:', err);
        }
      });
    },
    error: (error) => {
      console.error('Error loading developer:', error);
    }
  });
}

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        if(next.role_id === 1){
          this.loadCompany(next.id)
        }else if(next.role_id === 2){
          this.loadDeveloper(next.id)
          this.loadAllProjects()
        }
      }else{
        
      }
    })
  }

  loadProjects(id: any): void {
    this.projectsService.getProjectsByCompany(id)
    .subscribe({
      next: (data: any) => {
        this.projects = data;
      }
    });
  }

  rePublishProject(project: Project): void {
    this.currentProjectId = project.id;
    this.showAddEditDialog = true;
    this.isRepublishing = true; // Añade esta propiedad en la clase
  }

loadAllProjects(): void {
    this.projectsService.getAllProjects()
    .subscribe({
        next: (data) => {
            // Solo mantener proyectos activos para desarrolladores
            this.projects = this.developer 
                ? data.filter(project => project.status === 1)
                : data;
            
            // Aplicar filtros después de cargar
            this.filterProjects();
        },
        error: (error) => {
            this.notificationServices.showErrorCustom('No se pudo cargar proyectos');
        }
    });
}

// project.component.ts
hasApplied(projectId: number): boolean {
  return this.applications?.some(app => app.project_id === projectId && app.status !== 3) || false;
}

/*   openNew(): void {
    this.project = {} as Project;
    this.submitted = false;
    this.projectDialog = true;
  } */

  openNew(): void {
    this.currentProjectId = undefined;
    this.showAddEditDialog = true;
  }

  editProject(project: Project): void {
    this.currentProjectId = project.id;
    this.showAddEditDialog = true;
  }

  onProjectSaved(): void {
    this.showAddEditDialog = false;
    if (this.company) {
      this.loadProjects(this.company.id);
    } else {
      this.loadAllProjects();
    }
  }
/* 
  editProject(project: Project): void {
    this.project = { ...project };
    this.projectDialog = true;
  } */

  deleteProject(project: Project): void {
    this.project = { ...project };
    this.deleteProjectDialog = true; // Abre el diálogo
  }

  confirmDelete(): void {
    this.projectsService.deactivateProject(this.project.id)
    .subscribe({
      next: () => {
        this.notificationServices.showSuccessCustom('Proyecto desactivado')
        this.loadProjects(this.company.id);
        this.deleteProjectDialog = false;
        this.project = {} as Project;
      }
    });
  }

  hideDialog(): void {
    this.projectDialog = false;
    this.submitted = false;
  }

  saveProject(id: any): void {
    this.submitted = true;

    if (this.project.project_name?.trim()) {
      if (this.project.id) {
        // Update existing project
        const updateData: UpdateProject = {
          company_id: Number(id),
          category_id: 1, 
          project_name: this.project.project_name,
          description: this.project.description,
          budget: this.project.budget,
          days_available: this.project.days_available,
          status: this.project.status
        };

        this.projectsService.updateProject(this.project.id, updateData).subscribe({
          next: () => {
            this.notificationServices.showSuccessCustom('Proyecto actualizado')
            this.loadProjects(this.company.id);
            this.projectDialog = false;
            this.project = {} as Project;
          }
        });
      } else {
        // Create new project
        const newProject: any = {
          company_id: Number(id),
          category_id: 1,
          project_name: this.project.project_name,
          description: this.project.description,
          budget: this.project.budget,
          days_available: this.project.days_available,
          //status: this.project.status || 1
        };

        this.projectsService.createProject(newProject)
        .subscribe({
          next: () => {
            this.notificationServices.showSuccessCustom('Proyecto creado')
            this.loadProjects(this.company.id);
            this.projectDialog = false;
            this.project = {} as Project;
          }
        });
      }
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  confirmDeleteSelected(): void {
    this.deleteProjectsDialog = false;
    if (!this.selectedProjects || this.selectedProjects.length === 0) {
      this.notificationServices.showErrorCustom('No hay proyectos seleccionados')
      return;
    }
  
    // Create array of delete operations
    const deleteOperations = this.selectedProjects.map(project => 
      this.projectsService.deactivateProject(project.id)
    );
  
    // Execute all delete operations in parallel
    forkJoin(deleteOperations).subscribe({
      next: () => {
        this.notificationServices.showSuccessCustom(`${this.selectedProjects.length} proyectos desactivados`)
        this.loadProjects(this.company.id);
        this.selectedProjects = [];
      }
    });
  }

  sortProjects() {
    switch(this.selectedSort) {
      case 'newest':
        this.filteredProjects.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'oldest':
        this.filteredProjects.sort((a, b) => 
          new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'highest':
        this.filteredProjects.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'lowest':
        this.filteredProjects.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedSort = 'newest';
    this.filterProjects();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.first = event.first;
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

   getStatusText(status: number): string {
    switch (status) {
      case 0:
        return "Pendiente";
      case 1:
        return "Activo";
      case 2:
        return "Inactivo";
      case 4:
        return "Completado";
      case 3:
        return "Rechazado";
      case 4:
        return "Completado";
      case 5:
        return "Republicado";
      default:
        return "Desconocido";
    }
  }
  
  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();

}
