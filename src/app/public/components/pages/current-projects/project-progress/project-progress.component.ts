import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Project } from 'src/app/core/models/projects';
import { RatingService } from 'src/app/core/services/rating.service';
import { CreateRatingRequest } from 'src/app/core/models/ratings';

@Component({
  selector: 'app-project-progress',
  templateUrl: './project-progress.component.html',
  styleUrls: ['./project-progress.component.scss'],
  providers: [MessageService]
})
export class ProjectProgressComponent implements OnInit {
  projectId!: number;
  project!: Project;
  activeIndex: number = 0;
  steps: any[] = [
    { label: 'Proyecto Asignado', icon: 'pi pi-search' },
    { label: 'En Progreso', icon: 'pi pi-code' },
    { label: 'En Revisión', icon: 'pi pi-eye' },
    { label: 'Completado', icon: 'pi pi-check-circle' }
  ];
  isCompleted: boolean = false;
  
  // Dialog properties
  displayConfirmDialog: boolean = false;
  displayRatingDialog: boolean = false;
  nextAction: () => void = () => {};
  ratingScore: number = 5;
  ratingComment: string = '';
  isRating: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject();
    this.loadProgress();
  }

  loadProject() {
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
      this.project = JSON.parse(savedProject);
      
      if (this.project.id !== this.projectId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Proyecto no encontrado'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se encontraron datos del proyecto'
      });
    }
  }

  confirmNextStep() {
    this.displayConfirmDialog = true;
    this.nextAction = () => {
      if (this.activeIndex < this.steps.length - 1) {
        this.activeIndex++;
        this.saveProgress();
      } else {
        this.completeProject();
      }
    };
  }

  confirmPrevStep() {
    this.displayConfirmDialog = true;
    this.nextAction = () => {
      if (this.activeIndex > 0) {
        this.activeIndex--;
        this.saveProgress();
      }
    };
  }

  saveProgress() {
    const progressData = {
      projectId: this.projectId,
      currentStep: this.activeIndex,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`projectProgress_${this.projectId}`, JSON.stringify(progressData));
  }

  completeProject() {
    this.isCompleted = true;
    this.messageService.add({
      severity: 'success',
      summary: '¡Proyecto completado!',
      detail: 'El proyecto ha sido marcado como finalizado'
    });
    
    const progressData = {
      projectId: this.projectId,
      currentStep: this.activeIndex,
      isCompleted: true,
      completedDate: new Date().toISOString()
    };
    localStorage.setItem(`projectProgress_${this.projectId}`, JSON.stringify(progressData));
    
    localStorage.removeItem('currentProject');
    
    // Show rating dialog
    this.displayRatingDialog = true;
  }

  submitRating() {
    if (!this.project?.company?.[0]?.id) return;

    this.isRating = true;
    const ratingData: CreateRatingRequest = {
      company_id: this.project.company[0].id,
      score: this.ratingScore,
      comment: this.ratingComment,
      isVisible: true
    };

    this.ratingService.createRating(ratingData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Calificación enviada',
          detail: 'Gracias por calificar al cliente'
        });
        this.displayRatingDialog = false;
        this.resetRatingForm();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la calificación'
        });
      },
      complete: () => {
        this.isRating = false;
      }
    });
  }

  private resetRatingForm() {
    this.ratingScore = 5;
    this.ratingComment = '';
  }

  loadProgress() {
    const savedProgress = localStorage.getItem(`projectProgress_${this.projectId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.activeIndex = progress.currentStep || 0;
      this.isCompleted = progress.isCompleted || false;
    }
  }
}