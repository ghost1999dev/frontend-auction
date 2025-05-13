import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  projects: any[] = [];

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
    { label: 'Activo', value: 1 },
    { label: 'Inactivo', value: 0 }
  ];
  
  sortOptions: any[] = [
    { label: 'Más nuevo primero', value: 'newest' },
    { label: 'Más antiguo primero', value: 'oldest' },
    { label: 'Presupuesto mas alto', value: 'highest' },
    { label: 'Presupuesto mas bajo', value: 'lowest' }
  ];

  constructor(
    public layoutService: LayoutService, 
    public projectsService: ProjectsService,
    public router: Router
  ) { 
    this.ngOnInit()
  }

  ngOnInit(): void {
    this.loadProjects();
    this.filteredProjects = [...this.projects];
    this.filterProjects();
  }

  loadProjects(): void {
    this.projectsService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.clearFilters()
      },
      error: (error) => {
        console.error("Error: ", error)
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

}
