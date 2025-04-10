import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { map, Observable } from 'rxjs';
import { userResponse, usersWithImage } from '../models/users';
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
  }}
