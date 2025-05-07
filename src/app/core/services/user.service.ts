import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { catchError, forkJoin, map, Observable, shareReplay, throwError } from 'rxjs';
import { activateReq, activateRes, addUser, addUserResponse, updateFieldsGoogle, updateFieldsGoogleRes, updatePasswordUser, updatePasswordUserResponse, updateUser, updateUserErrorResponse, updateUserResponse, userResponse, userResponseById, usersWithImage } from '../models/users';
import { environment } from 'src/environments/environment';
import { DeveloperService } from './developer.service';
import { CompaniesService } from './companies.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersCache: Observable<usersWithImage[]> | null = null;
  private userCache = new Map<any, Observable<usersWithImage[]>>();

  constructor(
    private http: HttpClient,  
    private developerService: DeveloperService,
    private companiesService: CompaniesService,
    private NotificationService: NotificationService
  ) { }

  getUsers(): Observable<usersWithImage[]> {
    if (!this.usersCache) {
      this.usersCache = this.http.get<userResponse>(`${environment.server_url}users/show/all`).pipe(
        map(response => response.usersWithImage),
        shareReplay(1)
      );
    }
    return this.usersCache;
  }

  getUsersById(id: any): Observable<usersWithImage[]> {
    if (!this.userCache.has(id)) {
      const user$: any = this.http.get<userResponseById>(`${environment.server_url}users/show/${id}`).pipe(
        map(response => response.user),
        shareReplay(1)
      );
      this.userCache.set(id, user$);
    }
    return this.userCache.get(id)!;
  }

  clearCache(): void {
    this.usersCache = null;
    this.userCache.clear();
  }

  clearUserCache(id: any): void {
    this.userCache.delete(id);
  }

  createUsers(data: addUser) : Observable<addUserResponse | void>{
    return this.http.post<addUserResponse>(`${environment.server_url}users/create`, data)
    .pipe(
      map((res:addUserResponse)=> {
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  updatedUsers(data: updateUser, id: any) : Observable<updateUserResponse | void>{
    return this.http.put<updateUserResponse>(`${environment.server_url}users/update/${id}`, data)
    .pipe(
      map((res:updateUserResponse)=> {
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  updatedPasswordUsers(data: updatePasswordUser, id: any) : Observable<updatePasswordUserResponse | void>{
    return this.http.put<updatePasswordUserResponse>(`${environment.server_url}users/update-password/${id}`, data)
    .pipe(
      map((res:updatePasswordUserResponse)=> {
        return res;
      }),
      catchError((err: any) => this.handlerError(err.status))
    );
  }

  updatedUsersPassport(data: updateFieldsGoogle, id: any) : Observable<updateFieldsGoogleRes | void>{
    return this.http.patch<updateFieldsGoogleRes>(`${environment.server_url}users/update-fields/${id}`, data)
    .pipe(
      map((res:updateFieldsGoogleRes)=> {
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  validateEmailUser(data: activateReq) : Observable<activateRes | void>{
    return this.http.post<activateRes>(`${environment.server_url}users/validate-email`, data)
    .pipe(
      map((res:activateRes)=> {
        console.log(res)
        return res;
      }),
      catchError((err) => this.handlerError(err))
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

  public handlerError(err: { error?: any, message?: any, status?: number }): Observable<never> {
    if (!err) {
      return throwError('Error desconocido');
    }
  
    switch (err.error.status) {
      case 400:
        this.NotificationService.showErrorCustom(err.error.message);
        break;
      case 401:
        this.NotificationService.showErrorCustom(err.error.message);
        break;
      case 404:
        this.NotificationService.showErrorCustom(err.error.message);
        break;
      case 429:
        this.NotificationService.showErrorCustom(err.error.message);
        break;
      case 500:
        this.NotificationService.showErrorCustom(err.error.message);
        break;
      default:
        this.NotificationService.showErrorCustom(err.message .message);
    }

    for (let i = 0; i < err.error.details.length; i++) {
      this.NotificationService.showErrorCustom(err.error.details[i])
    }
  
    return throwError(err);
  }

}

  