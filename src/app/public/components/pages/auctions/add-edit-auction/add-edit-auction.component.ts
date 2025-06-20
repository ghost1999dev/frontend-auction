import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from 'src/app/core/models/projects';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AuctionService } from 'src/app/core/services/auction.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-add-edit-auction',
  templateUrl: './add-edit-auction.component.html',
  styleUrls: ['./add-edit-auction.component.scss'],
})
export class AddEditAuctionComponent implements OnInit {
  @Input() auctionId?: number | any;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  id: string = this.getUserInfo();

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
    private companiesService: CompaniesService,
    private userService: UserService,
    private notificationService: NotificationService,
    
  ) {
    this.auctionForm = this.fb.group({
      project_id: ['', Validators.required],
      bidding_started_at_date: [null, Validators.required],
      bidding_started_at_time: ['00:00', Validators.required],
      bidding_deadline_date: [null, Validators.required],
      bidding_deadline_time: ['00:00', Validators.required],
      status: [0]
    })
  }

  ngOnInit(): void {
    this.loadInitialData();
    
    if (this.auctionId) {
      this.loadAuction(this.auctionId);
    }

    // Escuchar cambios tanto en fecha como hora de inicio
    this.auctionForm.get('bidding_started_at_date')?.valueChanges.subscribe(() => {
      this.onStartDateChange();
    });
    
    this.auctionForm.get('bidding_started_at_time')?.valueChanges.subscribe(() => {
      this.onStartDateChange();
    });
  }

    private loadInitialData(): void {
      this.loading = true;
      this.userService.getUsersById(this.id).subscribe({
        next: (user: any) => {
          if (!user) return;
          
          if (user.role_id === 1) {
            this.loading = false
            this.loadCompanyData(user.id);
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private loadCompanyData(userId: number): void {
    this.companiesService.getCompanyByUserId(userId).subscribe({
      next: (company) => {
        this.loadProjects(company.id, 4);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadProjects(id: number, statusFilter: number): void {
      this.projectService.getProjectsByCompany(id).subscribe({
        next: (projects) => {
          this.projects = statusFilter !== undefined 
            ? projects.filter(project => project.status === statusFilter)
            : projects;
        }
      });
  }

  loadAuction(id: number): void {
    this.loading = true;
    this.auctionService.getAuctionById(id)
    .subscribe({
      next: (auction: any) => {
        const startDate = new Date(auction.bidding_started_at);
        const deadlineDate = new Date(auction.bidding_deadline);
        
        // Ajustar a hora local
        const startDateStr = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
        const startTimeStr = this.formatTime(startDate);
        const deadlineDateStr = `${deadlineDate.getFullYear()}-${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}-${deadlineDate.getDate().toString().padStart(2, '0')}`;
        const deadlineTimeStr = this.formatTime(deadlineDate);
        
        this.auctionForm.patchValue({
          project_id: auction.project_id,
          bidding_started_at_date: startDateStr,
          bidding_started_at_time: startTimeStr,
          bidding_deadline_date: deadlineDateStr,
          bidding_deadline_time: deadlineTimeStr,
          status: auction.status
        });
        
        // Actualizar la fecha mínima para el deadline
        this.minDeadlineDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

private combineDateTimeToISO(dateStr: string, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const date = new Date(dateStr);
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  // Formato: "YYYY-MM-DDTHH:mm" (sin Z ni conversión UTC)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate() + 1).toString().padStart(2, '0')}T${hours}:${minutes}:00`;
}

  onSubmit(): void {
    this.submitted = true;

    if (this.auctionForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.auctionForm.value;

    // Combinar fecha y hora para bidding_started_at
    if (formData.bidding_started_at_date && formData.bidding_started_at_time) {
      formData.bidding_started_at = this.combineDateTimeToISO(
        formData.bidding_started_at_date, 
        formData.bidding_started_at_time
      );
    }

    // Combinar fecha y hora para bidding_deadline
    if (formData.bidding_deadline_date && formData.bidding_deadline_time) {
      formData.bidding_deadline = this.combineDateTimeToISO(
        formData.bidding_deadline_date, 
        formData.bidding_deadline_time
      );
    }

    console.log('Datos a enviar:', {
      bidding_started_at: formData.bidding_started_at,
      bidding_deadline: formData.bidding_deadline
    });

    // Eliminar los campos temporales que ya no necesitamos
    delete formData.bidding_started_at_date;
    delete formData.bidding_started_at_time;
    delete formData.bidding_deadline_date;
    delete formData.bidding_deadline_time;


    if (this.auctionId) {

      // Update auction
      this.auctionService.updateAuction(this.auctionId, formData).subscribe({
        next: () => {
          this.notificationService.showSuccessCustom('Subasta actualizada exitosamente');
          this.saved.emit();
        },
        error: () => {
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
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  // Cambia la definición del validador a:

  // Agrega este método para calcular la fecha/hora final
private calculateDeadline(startDate: string, startTime: string): { date: string, time: string } {
  if (!startDate || !startTime) return { date: '', time: '' };

  // Parsear la fecha y hora localmente
  const [year, month, day] = startDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  // Crear objeto Date con componentes locales
  const startDateTime = new Date(year, month - 1, day, hours, minutes);

  // Agregar 15 minutos
  startDateTime.setMinutes(startDateTime.getMinutes() + 15);

  // Formatear la nueva fecha/hora en formato local
  const deadlineDate = `${startDateTime.getFullYear()}-${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}-${startDateTime.getDate().toString().padStart(2, '0')}`;
  const deadlineTime = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;

  return { date: deadlineDate, time: deadlineTime };
}

// Modifica el onStartDateChange para actualizar automáticamente el deadline
onStartDateChange(): void {
  const startDate = this.auctionForm.get('bidding_started_at_date')?.value;
  const startTime = this.auctionForm.get('bidding_started_at_time')?.value;

  if (startDate && startTime) {
    const deadline = this.calculateDeadline(startDate, startTime);
    
    this.auctionForm.patchValue({
      bidding_deadline_date: deadline.date,
      bidding_deadline_time: deadline.time
    }, { emitEvent: false });

    // Actualizar validación mínima
    this.minDeadlineDate = new Date(startDate);
  }
}

syncDeadlineDate() {
  const startDate = this.auctionForm.value.bidding_started_at_date;
  this.auctionForm.patchValue({
    bidding_deadline_date: startDate,
  }, { emitEvent: false }); // Evita bucles
}

// Convierte a formato 'YYYY-MM-DDTHH:mm' (sin segundos, compatible con datetime-local)
formatDateForInput(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Convierte Date a string 'YYYY-MM-DDTHH:mm' (formato datetime-local)
private toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Parsea el valor del input a Date sin UTC
private parseLocalDatetime(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

fixDatetime(event: Event, controlName: string) {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  // Fuerza el re-renderizado con el valor corregido
  this.auctionForm.patchValue({
    [controlName]: value,
  });
}


  onCancel(): void {
    this.cancelled.emit();
  }

  get f() { return this.auctionForm.controls; }

  private getUserInfo(): string {
    const token = localStorage.getItem("login-token");
    if (!token) return '';
    
    try {
      const payload = token.split(".")[1];
      return JSON.parse(window.atob(payload))['id'] || '';
    } catch (e) {
      console.error('Error parsing token:', e);
      return '';
    }
  }
}