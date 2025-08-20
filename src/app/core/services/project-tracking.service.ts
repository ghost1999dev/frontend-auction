import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HandlerErrorService } from './handler-error.service';
import { NotificationService } from './notification.service';
import { 
  ProjectTracking, 
  ProjectTrackingCreate, 
  ProjectTrackingResponse,
  ProjectStatus,
  ProjectHistoryResponse,
  CurrentStatusResponse
} from '../models/project-tracking';

@Injectable({
  providedIn: 'root'
})
export class ProjectTrackingService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private handlerErrorService: HandlerErrorService
  ) { }

  /**
   * Crea un nuevo estado de seguimiento para un proyecto
   * @param data Datos del seguimiento
   * @returns Observable con la respuesta
   */
  createTracking(data: ProjectTrackingCreate): Observable<ProjectTrackingResponse> {
    return this.http.post<ProjectTrackingResponse>(
      `${environment.server_url}project-tracking/create`, 
      data
    ).pipe(
      map((res: ProjectTrackingResponse) => {
        this.notificationService.showSuccessCustom(
          res.message || 'Estado de proyecto registrado exitosamente'
        );
        return res;
      }),
      catchError((err) => this.handlerErrorService.handlerError(err))
    );
  }

  /**
   * Obtiene el historial completo de estados de un proyecto
   * @param projectId ID del proyecto
   * @returns Observable con el historial
   */
  getProjectHistory(projectId: number): Observable<ProjectHistoryResponse> {
    return this.http.get<ProjectHistoryResponse>(
      `${environment.server_url}project-tracking/get-history/${projectId}`
    ).pipe(
      catchError((err) => this.handlerErrorService.handlerError(err))
    );
  }

  /**
   * Obtiene el estado actual de un proyecto
   * @param projectId ID del proyecto
   * @returns Observable con el estado actual
   */
  getCurrentStatus(projectId: number): Observable<CurrentStatusResponse> {
    return this.http.get<CurrentStatusResponse>(
      `${environment.server_url}project-tracking/get-all-status/${projectId}`
    ).pipe(
      catchError((err) => this.handlerErrorService.handlerError(err))
    );
  }

  getAllStatus(projectId: number): Observable<CurrentStatusResponse> {
    return this.http.get<CurrentStatusResponse>(
      `${environment.server_url}project-tracking/get-current-status/${projectId}`
    ).pipe(
      catchError((err) => this.handlerErrorService.handlerError(err))
    );
  }

  /**
   * Obtiene los estados posibles de un proyecto
   * @returns Objeto con los estados
   */
  getProjectStatus(): ProjectStatus {
    return {
      ASSIGNED: 1,
      IN_PROGRESS: 2,
      IN_REVIEW: 3,
      COMPLETED: 4
    };
  }
}