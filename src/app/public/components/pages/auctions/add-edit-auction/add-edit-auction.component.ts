import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from 'src/app/core/models/projects';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AuctionService } from 'src/app/core/services/auction.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-add-edit-auction',
  templateUrl: './add-edit-auction.component.html',
  styleUrls: ['./add-edit-auction.component.scss'],
})
export class AddEditAuctionComponent implements OnInit {
  @Input() auctionId?: number | any;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  auctionForm: FormGroup;
  loading = false;
  submitted = false;
  projects: Project[] = [];
  minStartDate: Date = new Date();
  maxStartDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  minDeadlineDate: Date = new Date();

  statuses = [
    { label: 'Pendiente', value: "0" },
    { label: 'Activa', value: "1" },
    { label: 'Completada', value: "2" },
    { label: 'Cancelada', value: "3" }
  ];

  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private projectService: ProjectsService,
    private notificationService: NotificationService,
  ) {
    this.auctionForm = this.fb.group({
      project_id: ['', Validators.required],
      bidding_started_at: [null, Validators.required], // Inicializar como null
      bidding_deadline: [null, Validators.required],  // Inicializar como null
      status: [0]
    }, { validators: this.validateDates });
  }

  ngOnInit(): void {
    this.loadProjects();
    
    if (this.auctionId) {
      this.loadAuction(this.auctionId);
    }
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        this.notificationService.showErrorCustom('Error al cargar los proyectos');
      }
    });
  }

loadAuction(id: number): void {
    this.loading = true;
    this.auctionService.getAuctionById(id)
    .subscribe({
      next: (auction: any) => {
        // Convertir las fechas ISO a formato yyyy-MM-dd para los inputs
        const startDate = new Date(auction.bidding_started_at).toISOString().split('T')[0];
        const deadlineDate = new Date(auction.bidding_deadline).toISOString().split('T')[0];
        
        this.auctionForm.patchValue({
          project_id: auction.project_id,
          bidding_started_at: startDate,
          bidding_deadline: deadlineDate,
          status: auction.status
        });
        
        // Actualizar la fecha mínima para el deadline
        this.minDeadlineDate = new Date(auction.bidding_started_at);
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showErrorCustom('Error al cargar la subasta');
        this.loading = false;
      }
    });
}

onSubmit(): void {
    this.submitted = true;

    if (this.auctionForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.auctionForm.value;

    // Convertir las fechas a formato ISO antes de enviar
    if (formData.bidding_started_at) {
      formData.bidding_started_at = new Date(formData.bidding_started_at).toISOString();
    }
    if (formData.bidding_deadline) {
      formData.bidding_deadline = new Date(formData.bidding_deadline).toISOString();
    }

    if (this.auctionId) {
      // Update auction
      this.auctionService.updateAuction(this.auctionId, formData).subscribe({
        next: () => {
          this.notificationService.showSuccessCustom('Subasta actualizada exitosamente');
          this.saved.emit();
        },
        error: (error) => {
          this.notificationService.showErrorCustom(error.error?.message || 'Error al actualizar la subasta');
          this.loading = false;
        }
      });
    } else {
      // Create auction
      this.auctionService.createAuction(formData).subscribe({
        next: () => {
          this.notificationService.showSuccessCustom('Subasta creada exitosamente');
          this.saved.emit();
        },
        error: (error) => {
          this.notificationService.showErrorCustom(error.error?.message || 'Error al crear la subasta');
          this.loading = false;
        }
      });
    }
}

validateDates(group: FormGroup): { [key: string]: any } | null {
  const start = group.get('bidding_started_at')?.value;
  const deadline = group.get('bidding_deadline')?.value;
  
  if (start && deadline && deadline <= start) {
    return { deadlineBeforeStart: true };
  }
  return null;
}

onStartDateChange(): void {
  const startDate = this.auctionForm.get('bidding_started_at')?.value;
  if (startDate) {
    this.minDeadlineDate = startDate;
    
    // Si el deadline actual es anterior a la nueva fecha de inicio, lo reseteamos
    const currentDeadline = this.auctionForm.get('bidding_deadline')?.value;
    if (currentDeadline && currentDeadline <= startDate) {
      this.auctionForm.get('bidding_deadline')?.setValue(null);
    }
  }
}

  onCancel(): void {
    this.cancelled.emit();
  }

  get f() { return this.auctionForm.controls; }
}