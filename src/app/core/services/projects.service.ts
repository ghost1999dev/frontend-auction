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
  ProjectFilter
} from '../models/projects';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(
    private http: HttpClient,  
    private notificationServices: NotificationService
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
        catchError((err) => this.handlerError(err))
      );
  }

  updateProject(id: number, data: UpdateProject): Observable<Project> {
    return this.http.put<ProjectResponseById>(`${environment.server_url}projects/update/${id}`, data)
      .pipe(
        map(response => response.project),
        catchError((err) => this.handlerError(err))
      );
  }

  deactivateProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.server_url}projects/desactivate/${id}`)
      .pipe(
        catchError((err) => this.handlerError(err))
      );
  }

  hardDeleteProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.server_url}projects/delete/${id}`)
      .pipe(
        catchError((err) => this.handlerError(err))
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

  public handlerError(err: { error?: any, message?: any, status?: number }): Observable<never> {
    if (!err) {
      return throwError('Error desconocido');
    }
  
    switch (err.error.status) {
      case 400:
        this.notificationServices.showErrorCustom(err.error.message);
        break;
      case 401:
        this.notificationServices.showErrorCustom(err.error.message);
        break;
      case 404:
        this.notificationServices.showErrorCustom(err.error.message);
        break;
      case 429:
        this.notificationServices.showErrorCustom(err.error.message);
        break;
      case 500:
        this.notificationServices.showErrorCustom(err.error.message);
        break;
      default:
        this.notificationServices.showErrorCustom(err.message .message);
    }

    for (let i = 0; i < err.error.details.length; i++) {
      this.notificationServices.showErrorCustom(err.error.details[i])
    }
  
    return throwError(err);
  }
}