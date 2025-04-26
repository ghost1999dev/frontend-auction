import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { CreateProject, Project, UpdateProject } from 'src/app/core/models/projects';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { UserService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [MessageService] // Add this line
})
export class ProjectComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  public company: any;
  public company_id!: number;
  public developer: any;

  projects: any[] = [];
  selectedProjects: Project[] = [];
  project: Project = {} as Project;

  projectDialog: boolean = false;
  deleteProjectDialog: boolean = false;
  deleteProjectsDialog: boolean = false;

  submitted: boolean = false;
  statuses: any[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
  ];

  // Filtering and pagination
  filteredProjects: any[] = [];
  searchTerm: string = '';
  selectedStatus: number | 1 | null = null ;
  selectedSort: string = 'newest';
  
  // Pagination
  page: number = 1;
  pageSize: number = 6;
  first: number = 0;
  
  // Options
  statusOptions: any[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
  ];
  
  sortOptions: any[] = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Budget', value: 'highest' },
    { label: 'Lowest Budget', value: 'lowest' }
  ];

  constructor(
    private projectsService: ProjectsService,
    private messageService: MessageService,
    private companiesService: CompaniesService,
    private userService: UserService,
    private notificationServices: NotificationService,
    private developerService: DeveloperService
  ) { }

  ngOnInit(): void {
    this.getUserById(this.id)
    this.filteredProjects = [...this.projects];
  }

  loadCompany(userId: number): void {
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.company = data;
        this.loadProjects(data.id)
      },
      error: (error: any) => {
        console.error('Error loading company:', error);
      }
    });
  }


  loadDeveloper(id: number): void {
    this.developerService.getDeveloperByIdUser(id)
    .subscribe({
      next: (data: any) => {
        this.developer = data;
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
      next: (data) => {
        this.projects = data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects',
          life: 3000
        });
      }
    });
  }

  loadAllProjects(): void {
    this.projectsService.getAllProjects()
    .subscribe({
      next: (data) => {
        this.projects = data;
        this.clearFilters()
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects',
          life: 3000
        });
      }
    });
  }

  openNew(): void {
    this.project = {} as Project;
    this.submitted = false;
    this.projectDialog = true;
  }

  editProject(project: Project): void {
    this.project = { ...project };
    this.projectDialog = true;
  }

  deleteProject(project: Project): void {
    this.project = { ...project };
    this.deleteProjectDialog = true;
  }

  confirmDelete(): void {
    this.projectsService.deactivateProject(this.project.id)
    .subscribe({
      next: () => {
        this.notificationServices.showSuccessCustom('Project Deactivated')
        this.loadProjects(this.company.id);
        this.deleteProjectDialog = false;
        this.project = {} as Project;
      },
      error: (error) => {
        this.notificationServices.showErrorCustom('Failed to deactivate project')
      }
    });
  }

  hideDialog(): void {
    this.projectDialog = false;
    this.submitted = false;
  }

  saveProject(id: any): void {
    console.log(id)
    this.submitted = true;

    if (this.project.project_name?.trim()) {
      if (this.project.id) {
        // Update existing project
        const updateData: UpdateProject = {
          company_id: Number(id),
          project_name: this.project.project_name,
          description: this.project.description,
          budget: this.project.budget,
          days_available: this.project.days_available,
          status: this.project.status
        };

        this.projectsService.updateProject(this.project.id, updateData).subscribe({
          next: () => {
            this.notificationServices.showSuccessCustom('Project Updated')
            this.loadProjects(this.company.id);
            this.projectDialog = false;
            this.project = {} as Project;
          },
          error: (error) => {
            this.notificationServices.showErrorCustom('Failed to update project')
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
          status: this.project.status || 1
        };

        console.log(newProject)

        this.projectsService.createProject(newProject)
        .subscribe({
          next: () => {
            this.notificationServices.showSuccessCustom('Project Created')
            this.loadProjects(this.company.id);
            this.projectDialog = false;
            this.project = {} as Project;
          },
          error: (error) => {
            this.notificationServices.showErrorCustom('Failed to create project')
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
      this.notificationServices.showErrorCustom('No projects selected')
      return;
    }
  
    // Create array of delete operations
    const deleteOperations = this.selectedProjects.map(project => 
      this.projectsService.deactivateProject(project.id)
    );
  
    // Execute all delete operations in parallel
    forkJoin(deleteOperations).subscribe({
      next: () => {
        this.notificationServices.showSuccessCustom(`${this.selectedProjects.length} projects deactivated`)
        this.loadProjects(this.company.id);
        this.selectedProjects = [];
      },
      error: (error: any) => {
        this.notificationServices.showErrorCustom('Failed to deactivate some projects')
      }
    });
  }

  filterProjects() {
    this.filteredProjects = this.projects.filter(project => {
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        project.project_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (project.company?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (project.category?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = this.selectedStatus === null || project.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sorting
    this.sortProjects();
    
    // Reset pagination
    this.page = 1;
    this.first = 0;
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
  
  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();

}
