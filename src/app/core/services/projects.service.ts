import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { 
  ProjectResponse, 
  ProjectResponseById, 
  Project, 
  CreateProject, 
  UpdateProject,
  ProjectFilter,
  ProjectHistoryResponse,
  ProjectHistory
} from '../models/projects';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(
    private http: HttpClient,  
    private notificationServices: NotificationService,
    private HandlerErrorSrv: HandlerErrorService,
  ) { }

  getAllProjects(filter?: ProjectFilter): Observable<Project[]> {
    return this.http.get<ProjectResponse>(`${environment.server_url}projects/show/all`, { params: filter as any })
      .pipe(
        map(response => response.projects)
      );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<ProjectResponseById>(`${environment.server_url}projects/show/${id}`)
      .pipe(
        map(response => response.project)
      );
  }

  createProject(data: CreateProject): Observable<Project> {
    return this.http.post<ProjectResponseById>(`${environment.server_url}projects/create`, data)
      .pipe(
        map(response => response.project),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  updateProject(id: number, data: UpdateProject): Observable<Project> {
    return this.http.put<ProjectResponseById>(`${environment.server_url}projects/update/${id}`, data)
      .pipe(
        map(response => response.project),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  deactivateProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.server_url}projects/desactivate/${id}`)
      .pipe(
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  hardDeleteProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.server_url}projects/delete/${id}`)
      .pipe(
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  getProjectsByCompany(companyId: number, filter?: ProjectFilter): Observable<Project[]> {
    return this.http.get<ProjectResponse>(`${environment.server_url}projects/show/companyProject/${companyId}`, { params: filter as any })
      .pipe(
        map(response => response.projects)
      );
  }

  getProjectsByCategory(categoryId: number, filter?: ProjectFilter): Observable<Project[]> {
    return this.http.get<ProjectResponse>(`${environment.server_url}projects/show/categoryProject/${categoryId}`, { params: filter as any })
      .pipe(
        map(response => response.projects)
      );
  }

  getProjectsHistoryByDeveloper(developerId: number): Observable<ProjectHistory[]> {
    return this.http.get<ProjectHistoryResponse>(`${environment.server_url}projects/developer-history/${developerId}`)
      .pipe(
        map(response => response.projects),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }
}