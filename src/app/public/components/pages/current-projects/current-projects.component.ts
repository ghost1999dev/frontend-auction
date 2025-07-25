import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/models/projects';

@Component({
  selector: 'app-current-projects',
  templateUrl: './current-projects.component.html',
  styleUrls: ['./current-projects.component.scss']
})
export class CurrentProjectsComponent {
  projects: Project[] = [
    {
      id: 1,
      company_id: 101,
      category_id: 5,
      project_name: "Plataforma E-commerce",
      description: "Desarrollo de plataforma similar a Shopify",
      long_description: "Desarrollar una plataforma de comercio electrónico completa con gestión de productos, carrito de compras e integración de pagos.",
      short_description: "Desarrollo de plataforma e-commerce",
      full_description: "Este proyecto implica crear una plataforma de comercio electrónico responsive desde cero usando Angular para el frontend y Node.js para el backend. Debe incluir autenticación de usuarios, catálogo de productos, carrito de compras e integración con Stripe.",
      budget: 5000,
      days_available: 30,
      status: 1,
      createdAt: "2023-05-15T10:00:00Z",
      updatedAt: "2023-05-20T14:30:00Z",
      category: [
        { id: 5, name: "Desarrollo Web" }
      ],
      company: [
        { id: 101, name: "TechRetail S.A." }
      ]
    },
    {
      id: 2,
      company_id: 102,
      category_id: 3,
      project_name: "App de Salud Móvil",
      description: "Desarrollo de aplicación de seguimiento fitness",
      long_description: "Crear una aplicación móvil multiplataforma para seguimiento de entrenamientos, nutrición y métricas de salud.",
      short_description: "App móvil de seguimiento fitness",
      full_description: "El proyecto requiere construir una aplicación en React Native que registre entrenamientos, ingesta nutricional y métricas de salud. Debe sincronizar con dispositivos wearables y proporcionar paneles analíticos. El backend se implementará con Firebase.",
      budget: 7500,
      days_available: 45,
      status: 1,
      createdAt: "2023-06-01T09:15:00Z",
      updatedAt: "2023-06-10T11:20:00Z",
      category: [
        { id: 3, name: "Desarrollo Móvil" }
      ],
      company: [
        { id: 102, name: "Soluciones HealthWave" }
      ]
    }
  ];

  constructor(private router: Router) {}

  filterTable(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  getSeverity(status: any): any {
    return status === 1 ? 'success' : 'danger';
  }

  navigateToProgress(project: Project) {
    // Guardar el proyecto en LocalStorage
    localStorage.setItem('currentProject', JSON.stringify(project));
    this.router.navigate(['/main/project-progress', project.id]);
  }

  getStatusText(status: number): string {
    return status === 1 ? 'Activo' : 'Inactivo';
  }

  viewProjectDetails(project: Project) {
    // Lógica para ver detalles del proyecto
}

editProjectProgress(project: Project) {
    // Lógica para editar progreso
}

completeProject(project: Project) {
    // Lógica para marcar como completado
}
}