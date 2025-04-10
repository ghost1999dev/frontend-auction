import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { catchError, map, Observable } from 'rxjs';
import { activateReq, activateRes, addUser, addUserResponse, userResponse, usersWithImage } from '../models/users';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,  private HandlerErrorSrv: HandlerErrorService) { }

  getUsers(): Observable<usersWithImage[]> {
    return this.http.get<userResponse>(`${environment.server_url}users/show/all`)
    .pipe(
      map(response => response.usersWithImage)
    )
  }

  createUsers(data: addUser) : Observable<addUserResponse | void>{
    return this.http.post<addUserResponse>(`${environment.server_url}users/create`, data)
    .pipe(
      map((res:addUserResponse)=> {
        return res;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  validateEmailUser(data: activateReq) : Observable<activateRes | void>{
    return this.http.post<activateRes>(`${environment.server_url}users/validate-email`, data)
    .pipe(
      map((res:activateRes)=> {
        return res;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

}

  