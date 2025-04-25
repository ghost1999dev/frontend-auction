import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { CreateProject, Project, UpdateProject } from 'src/app/core/models/projects';
import { ProjectsService } from 'src/app/core/services/projects.service';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [MessageService] // Add this line
})
export class ProjectComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  projects: Project[] = [];
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

  constructor(
    private projectsService: ProjectsService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsService.getAllProjects().subscribe({
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
    this.projectsService.deactivateProject(this.project.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Project Deactivated',
          life: 3000
        });
        this.loadProjects();
        this.deleteProjectDialog = false;
        this.project = {} as Project;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to deactivate project',
          life: 3000
        });
      }
    });
  }

  hideDialog(): void {
    this.projectDialog = false;
    this.submitted = false;
  }

  saveProject(): void {
    this.submitted = true;

    if (this.project.project_name?.trim()) {
      if (this.project.id) {
        // Update existing project
        const updateData: UpdateProject = {
          project_name: this.project.project_name,
          description: this.project.description,
          budget: this.project.budget,
          days_available: this.project.days_available,
          status: this.project.status
        };

        this.projectsService.updateProject(this.project.id, updateData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Project Updated',
              life: 3000
            });
            this.loadProjects();
            this.projectDialog = false;
            this.project = {} as Project;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update project',
              life: 3000
            });
          }
        });
      } else {
        // Create new project
        const newProject: CreateProject = {
          company_id: this.project.company_id,
          category_id: this.project.category_id,
          project_name: this.project.project_name,
          description: this.project.description,
          budget: this.project.budget,
          days_available: this.project.days_available,
          status: this.project.status || 1
        };

        this.projectsService.createProject(newProject).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Project Created',
              life: 3000
            });
            this.loadProjects();
            this.projectDialog = false;
            this.project = {} as Project;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create project',
              life: 3000
            });
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
      this.messageService.add({
        severity: 'warn', 
        summary: 'Warning',
        detail: 'No projects selected',
        life: 3000
      });
      return;
    }
  
    // Create array of delete operations
    const deleteOperations = this.selectedProjects.map(project => 
      this.projectsService.deactivateProject(project.id)
    );
  
    // Execute all delete operations in parallel
    forkJoin(deleteOperations).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: `${this.selectedProjects.length} projects deactivated`,
          life: 3000
        });
        this.loadProjects();
        this.selectedProjects = [];
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to deactivate some projects',
          life: 3000
        });
      }
    });
  }
}
