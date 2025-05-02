import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { addCompanies, addCompaniesRes, companies, CompanyResponseByUserId, CompanyWithRelations, getCompaniesResponse, UpdateCompany, UpdateCompanyResponse } from '../models/companies';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  private companiesCache: Observable<companies[]> | null = null;

  constructor(private http: HttpClient, private notificationServices: NotificationService) { }

  getAllCompanies(): Observable<companies[]> {
    if (!this.companiesCache) {
      this.companiesCache = this.http.get<getCompaniesResponse>(
        `${environment.server_url}companies/show/all`
      ).pipe(
        map(response => response.companies),
        shareReplay(1) // Cache the response and replay to future subscribers
      );
    }
    return this.companiesCache;
  }

  getCompanyByUserId(userId: number): Observable<CompanyWithRelations> {
    return this.http.get<CompanyResponseByUserId>(`${environment.server_url}companies/show/user_id/${userId}`)
      .pipe(
        map(response => response.company),
        catchError((err) => this.handlerError(err))
      );
  }

  updateCompany(id: number, data: UpdateCompany): Observable<CompanyWithRelations> {
    return this.http.put<UpdateCompanyResponse>(`${environment.server_url}companies/update/${id}`, data)
      .pipe(
        map(response => response.company),
        catchError((err) => this.handlerError(err))
      );
  }

  // Optional: Method to clear cache when needed
  clearCompaniesCache(): void {
    this.companiesCache = null;
  }

  // Optional: Method to force refresh (clear cache and fetch new data)
  refreshCompanies(): Observable<companies[]> {
    this.clearCompaniesCache();
    return this.getAllCompanies();
  }

  createCompanies(data: addCompanies) : Observable<addCompaniesRes | void>{
    return this.http.post<addCompaniesRes>(`${environment.server_url}companies/create`, data)
    .pipe(
      map((res:addCompaniesRes)=> {
        return res;
      }),
      catchError((err) => this.handlerError(err))
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
