import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/core/models/projects';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: any | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  statusOptions = [
    //{ label: 'Pendiente', value: 0 },
    { label: 'Activo', value: 1 },
    //{ label: 'Inactivo', value: 2 },
    { label: 'Rechazado', value: 3 },
    //{ label: 'Completado', value: 4 },
    //{ label: 'Republicado', value: 5 }
  ];
  withdrawReason: string = '';

  selectedStatus!: number;
  sanitizedLongDescription: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private projectService: ProjectsService,
    public layoutService: LayoutService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.projectService.getProjectById(id)
    .subscribe({
      next: (project: any) => {
        this.project = project;
        
        this.selectedStatus = project.status; 
        this.sanitizedLongDescription = project.long_description || 
                                 project.full_description || 
                                 'No hay descripción disponible';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
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

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }}