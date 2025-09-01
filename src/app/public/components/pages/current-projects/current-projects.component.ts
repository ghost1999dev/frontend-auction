import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Project } from 'src/app/core/models/projects';
import { WinnerHistoryItem } from 'src/app/core/models/bids';
import { BidService } from 'src/app/core/services/bids.service';
import { ReportService } from 'src/app/core/services/report.service';
import { CreateReportRequest, Report, FilterReportsParams } from 'src/app/core/models/reports';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-current-projects',
  templateUrl: './current-projects.component.html',
  styleUrls: ['./current-projects.component.scss'],
})
export class CurrentProjectsComponent implements OnInit {
  projects: any[] = [];
  loading: boolean = true;
  displayReportDialog: boolean = false;
  reportReason: string = '';
  reportComment: string = '';
  selectedProject: any = null;
  existingReport: Report | null = null;
  userReports: Report[] = [];

  constructor(
    private router: Router,
    private bidService: BidService,
    private notificationSrv: NotificationService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.loadWonProjects();
    this.loadUserReports();
  }

  loadWonProjects(): void {
    this.loading = true;
    this.bidService.getWinnersHistory().subscribe({
      next: (response: any) => {
        if (response) {
          const currentUserId = this.id;
          this.projects = response.filter((item: WinnerHistoryItem) => 
            item.winner_id === currentUserId
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading won projects:', error);
        this.loading = false;
      }
    });
  }

  loadUserReports(): void {
    const params: FilterReportsParams = {
      page: 1,
      limit: 100 // Obtener todos los reportes del usuario
    };

    this.reportService.getAllReports(params).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.userReports = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading user reports:', error);
      }
    });
  }

  showReportDialog(project: any): void {
    this.selectedProject = project;
    this.reportReason = '';
    this.reportComment = '';
    
    // Verificar si ya existe un reporte para este proyecto
    this.existingReport = this.findExistingReport(project);
    
    this.displayReportDialog = true;
  }

  findExistingReport(project: any): Report | null {
    if (!this.userReports.length) return null;
    
    return this.userReports.find(report => 
      report.project_id === project.auction.project.id && 
      report.user_id === project.auction.project.company_profile.user.id
    ) || null;
  }

  getStatusSeverity(status: string): any {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'resuelto':
        return 'success';
      case 'rechazado':
        return 'danger';
      case 'desactivado':
        return 'secondary';
      default:
        return 'info';
    }
  }

  submitReport(): void {
    if (!this.reportReason.trim()) {
      this.notificationSrv.showErrorCustom('Campo requerido')
      return;
    }

    const reportData: CreateReportRequest = {
      user_id: this.selectedProject.auction.project.company_profile.user.id,
      project_id: this.selectedProject.auction.project.id,
      reason: this.reportReason,
      comment: this.reportComment
    };

    this.reportService.createReport(reportData).subscribe({
      next: (response) => {
        this.notificationSrv.showSuccessCustom('Reporte enviado')
        
        // Recargar los reportes del usuario para incluir el nuevo
        this.loadUserReports();
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error al enviar el reporte:', error);
        let errorMessage = 'No se pudo enviar el reporte. Inténtalo nuevamente.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }
    });
  }

  closeDialog(): void {
    this.displayReportDialog = false;
    this.reportReason = '';
    this.reportComment = '';
    this.selectedProject = null;
    this.existingReport = null;
  }

  filterTable(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  getSeverity(status: any): any {
    return status === 1 ? 'success' : 'danger';
  }

  navigateToProgress(project: any) {
    this.router.navigate(['/main/project-progress', project.auction.project.id]);
  }

  getStatusText(status: number): string {
    return status === 1 ? 'Activo' : 'Inactivo';
  }

  getUserInfo(data: string) {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)[data];
    } else {
      return null;
    }
  }

  getTokens() {
    return localStorage.getItem("login-token");
  }

  profile_id: any = this.getUserInfo("profile_id");
  id: any = this.getUserInfo("id");
}