import { Injectable } from '@angular/core';
import { HandlerErrorService } from './handler-error.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { companies, getCompaniesResponse } from '../models/companies';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

    constructor(private http: HttpClient,  private HandlerErrorSrv: HandlerErrorService) { }

    getAllCompanies(): Observable<companies[]> {
      return this.http.get<getCompaniesResponse>(`${environment.server_url}companies/show/all`)
      .pipe(
        map(response => response.companies)
      )
    }

}
