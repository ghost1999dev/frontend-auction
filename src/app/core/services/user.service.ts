import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { catchError, forkJoin, map, Observable, shareReplay, throwError } from 'rxjs';
import { activateReq, activateRes, addUser, addUserResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, updateFieldsGoogle, updateFieldsGoogleRes, updatePasswordUser, updatePasswordUserResponse, updateUser, updateUserErrorResponse, updateUserResponse, userResponse, userResponseById, usersWithImage } from '../models/users';
import { environment } from 'src/environments/environment';
import { DeveloperService } from './developer.service';
import { CompaniesService } from './companies.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,  
    private developerService: DeveloperService,
    private companiesService: CompaniesService,
    private NotificationService: NotificationService,
    private HandlerErrorSrv: HandlerErrorService,
  ) { }

  getUsers(): Observable<usersWithImage[]> {
    return this.http.get<userResponse>(`${environment.server_url}users/show/all`).pipe(
        map(response => response.usersWithImage),
        shareReplay(1)
      );
  }

  getUsersById(id: any): Observable<usersWithImage[]> {
    return this.http.get<userResponseById>(`${environment.server_url}users/show/${id}`).pipe(
        map(response => response.user),
        shareReplay(1)
      );
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

  updatedUsers(data: updateUser, id: any) : Observable<updateUserResponse | void>{
    return this.http.put<updateUserResponse>(`${environment.server_url}users/update/${id}`, data)
    .pipe(
      map((res:updateUserResponse)=> {
        return res;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  updatedPasswordUsers(data: updatePasswordUser, id: any) : Observable<updatePasswordUserResponse | void>{
    return this.http.put<updatePasswordUserResponse>(`${environment.server_url}users/update-password/${id}`, data)
    .pipe(
      map((res:updatePasswordUserResponse)=> {
        return res;
      }),
      catchError((err: any) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  updatedUsersPassport(data: updateFieldsGoogle, id: any) : Observable<updateFieldsGoogleRes | void>{
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

    forgotPassword(data: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${environment.server_url}users/forgot-password`, data)
      .pipe(
        map((res: ForgotPasswordResponse) => {
          this.NotificationService.showSuccessCustom('Código de recuperación enviado a tu correo');
          return res;
        }),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${environment.server_url}users/reset-password`, data)
      .pipe(
        map((res: ResetPasswordResponse) => {
          this.NotificationService.showSuccessCustom('Contraseña actualizada correctamente');
          return res;
        }),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }
}

  