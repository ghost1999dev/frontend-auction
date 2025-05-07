import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { HandlerErrorService } from '../services/handler-error.service';
import { UserAuth, UserResponseAuth } from '../models/users';
import { environment } from 'src/environments/environment';
import { UserService } from '../services/user.service';
import { DeveloperService } from '../services/developer.service';
import { CompaniesService } from '../services/companies.service';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private userService: UserService,
    private companiesService: CompaniesService,
    private developerService: DeveloperService,
    private notificationServices: NotificationService,
    ) {
    this.checkToken();
  }

  get isLogged(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  public login(authData: UserAuth):Observable<UserResponseAuth | void> {
    return this.http
    .post<UserResponseAuth>(`${environment.server_url}users/auth`, authData)
    .pipe(
      map((res: UserResponseAuth) =>{
        //save token
        this.saveToken(res.token);
        this.loggedIn.next(true);
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  public logout():void{
    localStorage.removeItem('login-token');
    localStorage.removeItem('isLoggedin');
    this.userService.clearCache()
    this.developerService.clearDevelopersCache()
    this.companiesService.clearCompaniesCache()

    this.loggedIn.next(false);
    this.router.navigate(['auth/login']);
  }

  private checkToken(): void{
    let userToken = localStorage.getItem('login-token') as string;
    const isExpired = helper.isTokenExpired(userToken);
    if(isExpired) {
      this.logout();
    }else{
      this.loggedIn.next(true);
    }
  }

  public saveToken(token:string):void{
    localStorage.setItem('login-token', token);
  }

  IsLoggedIn() {
    return !!localStorage.getItem('login-token');
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
