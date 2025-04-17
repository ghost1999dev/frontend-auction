import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { catchError, forkJoin, map, Observable } from 'rxjs';
import { activateReq, activateRes, addUser, addUserResponse, updateFieldsGoogle, updateFieldsGoogleRes, userResponse, userResponseById, usersWithImage } from '../models/users';
import { environment } from 'src/environments/environment';
import { DeveloperService } from './developer.service';
import { CompaniesService } from './companies.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,  
    private HandlerErrorSrv: HandlerErrorService,
    private developerService: DeveloperService,
    private companiesService: CompaniesService
  ) { }

  getUsers(): Observable<usersWithImage[]> {
    return this.http.get<userResponse>(`${environment.server_url}users/show/all`)
    .pipe(
      map(response => response.usersWithImage)
    )
  }

  getUsersById(id: any): Observable<usersWithImage[]> {
    return this.http.get<userResponseById>(`${environment.server_url}users/show/${id}`)
    .pipe(
      map(response => response.user)
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

  uopdatedUsersPassport(data: updateFieldsGoogle, id: any) : Observable<updateFieldsGoogleRes | void>{
    return this.http.patch<updateFieldsGoogleRes>(`${environment.server_url}users/update-fields/${id}`, data)
    .pipe(
      map((res:updateFieldsGoogleRes)=> {
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

  checkUserRoles(userId: number): Observable<{ hasRole: boolean }> {
    return forkJoin([
      this.companiesService.getAllCompanies(),
      this.developerService.getAllDevelopers()
    ]).pipe(
      map(([companies, developers]) => {
        const isCompany = companies.some(c => c.user_id === userId);
        const isDeveloper = developers.some(d => d.user_id === userId);
        return { hasRole: isCompany || isDeveloper };
      })
    );
  }


}

  