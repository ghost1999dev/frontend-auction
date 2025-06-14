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

  constructor(
    private http: HttpClient, 
    private HandlerErrorSrv: HandlerErrorService
  ) { }

  getAllCompanies(): Observable<companies[]> {
    return this.http.get<getCompaniesResponse>(
        `${environment.server_url}companies/show/all`
      ).pipe(
        map(response => response.companies),
        shareReplay(1) 
      );
  }

  getCompanyByUserId(userId: number): Observable<CompanyWithRelations> {
    return this.http.get<CompanyResponseByUserId>(`${environment.server_url}companies/show/user_id/${userId}`)
      .pipe(
        map(response => response.company),
      );
  }

  updateCompany(id: number, data: UpdateCompany): Observable<CompanyWithRelations> {
    return this.http.put<UpdateCompanyResponse>(`${environment.server_url}companies/update/${id}`, data)
      .pipe(
        map(response => response.company),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  createCompanies(data: addCompanies) : Observable<addCompaniesRes | void>{
    return this.http.post<addCompaniesRes>(`${environment.server_url}companies/create`, data)
    .pipe(
      map((res:addCompaniesRes)=> {
        return res;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

}
