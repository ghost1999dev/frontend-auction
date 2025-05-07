import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { addDeveloper, addDeveloperResponse, DeveloperResponseById, DeveloperWithRelations, getDeveloper, getDeveloperResponse, UpdateDeveloper, UpdateDeveloperResponse } from '../models/developer';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {

  private developersCache: Observable<getDeveloper[]> | null = null;

  constructor(private http: HttpClient, private notificationServices: NotificationService) { }

  createDeveloper(data: addDeveloper) : Observable<addDeveloperResponse | void>{
    return this.http.post<addDeveloperResponse>(`${environment.server_url}developers/create`, data)
    .pipe(
      map((res:addDeveloperResponse)=> {
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  getDeveloperByIdUser(id: number): Observable<DeveloperWithRelations> {
    return this.http.get<DeveloperResponseById>(`${environment.server_url}developers/show/user_id/${id}`)
      .pipe(
        map(response => response.developer),
        catchError((err) => this.handlerError(err))
      );
  }

  getAllDevelopers(): Observable<getDeveloper[]> {  
    if (!this.developersCache) {
      this.developersCache = this.http.get<getDeveloperResponse>(
        `${environment.server_url}developers/show/all`
      ).pipe(
        map(response => response.developers),
        shareReplay(1) // Cache the response and replay to future subscribers
      );
    }
    return this.developersCache;
  }

  updateDeveloper(id: number, data: UpdateDeveloper): Observable<DeveloperWithRelations> {
    return this.http.put<UpdateDeveloperResponse>(`${environment.server_url}developers/update/${id}`, data)
      .pipe(
        map(response => response.developer),
        catchError((err) => this.handlerError(err))
      );
  }

  // Optional: Method to clear cache when needed
  clearDevelopersCache(): void {
    this.developersCache = null;
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
