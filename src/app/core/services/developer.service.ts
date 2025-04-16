import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { addDeveloper, addDeveloperResponse, getDeveloper, getDeveloperResponse } from '../models/developer';
import { catchError, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {

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

  getAllDevelopers(): Observable<getDeveloper[]> {
    return this.http.get<getDeveloperResponse>(`${environment.server_url}developers/show/all`)
    .pipe(
      map(response => response.developers)
    )
  }

}
