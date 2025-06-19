import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
import { Application } from 'express';
import { ApplicationResponse, SingleApplicationResponse, CreateApplicationRequest, UpdateApplicationRequest, ApplicationsCounterResponse } from '../models/applications_projects';
import { HandlerErrorService } from './handler-error.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectApplicationsService {

  constructor(
    private http: HttpClient,
    private HandlerErrorSrv: HandlerErrorService,
  ) { }


  // Application CRUD Operations
  getAllApplications(): Observable<any> {
    return this.http.get<ApplicationResponse>(`${environment.server_url}application-projects/show/all`).pipe(
        map(response => response.applications),
        shareReplay(1),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  getApplicationById(id: number): Observable<any> {
    return this.http.get<SingleApplicationResponse>(`${environment.server_url}application-projects/${id}`).pipe(
        map(response => response.application),
        shareReplay(1),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  createApplication(applicationData: CreateApplicationRequest): Observable<Application> {
    return this.http.post<Application>(`${environment.server_url}application-projects/create`, applicationData).pipe(
      map(response => {
        return response;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  updateApplication(id: number, applicationData: UpdateApplicationRequest): Observable<Application> {
    return this.http.put<Application>(`${environment.server_url}application-projects/update/${id}`, applicationData).pipe(
      map(response => {
        return response;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${environment.server_url}application-projects/delete/${id}`).pipe(
      map(response => {
        return response;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getApplicationsByDeveloper(developerId: number): Observable<any[]> {
    return this.http.get<ApplicationResponse>(`${environment.server_url}application-projects/my-applications/${developerId}`).pipe(
        map(response => response.applications),
        shareReplay(1),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  getApplicationsCounter(developerId: number): Observable<number> {
    return this.http.get<ApplicationsCounterResponse>(`${environment.server_url}application-projects/counter/${developerId}`).pipe(
      map(response => response.applications),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }
}