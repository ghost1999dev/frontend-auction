import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
import { Application } from 'express';
import { ApplicationResponse, SingleApplicationResponse, CreateApplicationRequest, UpdateApplicationRequest, ApplicationsCounterResponse } from '../models/applications_projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectApplicationsService {

  private applicationsCache: Observable<Application[]> | any = null;
  private applicationCache = new Map<number, Observable<Application>>();
  private developerApplicationsCache = new Map<number, Observable<Application[]>>();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  // Cache management
  clearCache(): void {
    this.applicationsCache = null;
    this.applicationCache.clear();
    this.developerApplicationsCache.clear();
  }

  clearApplicationCache(id: number): void {
    this.applicationCache.delete(id);
  }

  clearDeveloperApplicationsCache(developerId: number): void {
    this.developerApplicationsCache.delete(developerId);
  }

  // Application CRUD Operations
  getAllApplications(): Observable<Application[]> {
    if (!this.applicationsCache) {
      this.applicationsCache = this.http.get<ApplicationResponse>(`${environment.server_url}application-projects/show/all`).pipe(
        map(response => response.applications),
        shareReplay(1),
        catchError((err) => this.handlerError(err))
      );
    }
    return this.applicationsCache;
  }

  getApplicationById(id: number): Observable<Application> {
    if (!this.applicationCache.has(id)) {
      const application$: any = this.http.get<SingleApplicationResponse>(`${environment.server_url}application-projects/${id}`).pipe(
        map(response => response.application),
        shareReplay(1),
        catchError((err) => this.handlerError(err))
      );
      this.applicationCache.set(id, application$);
    }
    return this.applicationCache.get(id)!;
  }

  createApplication(applicationData: CreateApplicationRequest): Observable<Application> {
    return this.http.post<Application>(`${environment.server_url}application-projects/create`, applicationData).pipe(
      map(response => {
        this.clearCache();
        return response;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  updateApplication(id: number, applicationData: UpdateApplicationRequest): Observable<Application> {
    return this.http.put<Application>(`${environment.server_url}application-projects/update/${id}`, applicationData).pipe(
      map(response => {
        this.clearApplicationCache(id);
        return response;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${environment.server_url}application-projects/delete/${id}`).pipe(
      map(response => {
        this.clearCache();
        return response;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  // Additional Application Operations
  getApplicationsByDeveloper(developerId: number): Observable<Application[]> {
    if (!this.developerApplicationsCache.has(developerId)) {
      const applications$: any = this.http.get<ApplicationResponse>(`${environment.server_url}application-projects/my-applications/${developerId}`).pipe(
        map(response => response.applications),
        shareReplay(1),
        catchError((err) => this.handlerError(err))
      );
      this.developerApplicationsCache.set(developerId, applications$);
    }
    return this.developerApplicationsCache.get(developerId)!;
  }

  getApplicationsCounter(developerId: number): Observable<number> {
    return this.http.get<ApplicationsCounterResponse>(`${environment.server_url}application-projects/counter/${developerId}`).pipe(
      map(response => response.applications),
      catchError((err) => this.handlerError(err))
    );
  }

  private handlerError(err: { error?: any, message?: any, status?: number }): Observable<never> {
    if (!err) {
      return throwError(() => 'Error desconocido');
    }

    switch (err.error?.status) {
      case 400:
        this.notificationService.showErrorCustom(err.error?.message || 'Solicitud incorrecta');
        break;
      case 401:
        this.notificationService.showErrorCustom(err.error?.message || 'No autorizado');
        break;
      case 404:
        this.notificationService.showErrorCustom(err.error?.message || 'Recurso no encontrado');
        break;
      case 409:
        this.notificationService.showErrorCustom(err.error?.message || 'Conflicto con el estado actual');
        break;
      case 422:
        this.notificationService.showErrorCustom(err.error?.message || 'Entidad no procesable');
        break;
      case 429:
        this.notificationService.showErrorCustom(err.error?.message || 'Demasiadas solicitudes');
        break;
      case 500:
        this.notificationService.showErrorCustom(err.error?.message || 'Error del servidor');
        break;
      default:
        this.notificationService.showErrorCustom(err.message || 'Error desconocido');
    }

    if (err.error?.details?.length) {
      for (const detail of err.error.details) {
        this.notificationService.showErrorCustom(detail);
      }
    }

    return throwError(() => err);
  }
}