import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { addDeveloper, addDeveloperResponse, DeveloperResponseById, DeveloperWithRelations, getDeveloper, getDeveloperResponse, UpdateDeveloper, UpdateDeveloperResponse } from '../models/developer';
import { catchError, map, Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {

  private developersCache: Observable<getDeveloper[]> | null = null;

  constructor(private http: HttpClient,  private HandlerErrorSrv: HandlerErrorService) { }

  createDeveloper(data: addDeveloper) : Observable<addDeveloperResponse | void>{
    return this.http.post<addDeveloperResponse>(`${environment.server_url}developers/create`, data)
    .pipe(
      map((res:addDeveloperResponse)=> {
        return res;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getDeveloperByIdUser(id: number): Observable<DeveloperWithRelations> {
    return this.http.get<DeveloperResponseById>(`${environment.server_url}developers/show/user_id/${id}`)
      .pipe(
        map(response => response.developer),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
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
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  // Optional: Method to clear cache when needed
  clearDevelopersCache(): void {
    this.developersCache = null;
  }

}
