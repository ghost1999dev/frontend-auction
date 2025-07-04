import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HandlerErrorService } from "./handler-error.service";
import {
  ActiveCompaniesResponse,
  ActiveDevelopersResponse,
  ProjectsByStatusResponse,
  ReportsByStatusResponse,
  TotalCategoriesResponse,
  AdminsByStatusResponse,
  RatingsDistributionResponse,
  MyAverageRatingResponse,
  MyProjectsByStatusResponse,
  MyProjectsWithApplicantsResponse,
  MyRatingsDistributionResponse,
  TotalApplicationsResponse,
  TotalFavoritesResponse,
} from "../models/dashboard";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private handlerErrorSrv: HandlerErrorService
  ) {}

  // Individual endpoints
  getActiveCompaniesCount(): Observable<ActiveCompaniesResponse> {
    return this.http
      .get<ActiveCompaniesResponse>(
        `${environment.server_url}dashboard/count/activeCompanies`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getActiveDevelopersCount(): Observable<ActiveDevelopersResponse> {
    return this.http
      .get<ActiveDevelopersResponse>(
        `${environment.server_url}dashboard/count/activeDevelopers`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getProjectsByStatus(): Observable<ProjectsByStatusResponse> {
    return this.http
      .get<ProjectsByStatusResponse>(
        `${environment.server_url}dashboard/count/projectsByStatus`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getReportsByStatus(): Observable<ReportsByStatusResponse> {
    return this.http
      .get<ReportsByStatusResponse>(
        `${environment.server_url}dashboard/count/reportsByStatus`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getTotalCategories(): Observable<TotalCategoriesResponse> {
    return this.http
      .get<TotalCategoriesResponse>(
        `${environment.server_url}dashboard/count/totalCategories`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getAdminsByStatus(): Observable<AdminsByStatusResponse> {
    return this.http
      .get<AdminsByStatusResponse>(
        `${environment.server_url}dashboard/count/adminsByStatus`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  getRatingsDistribution(): Observable<RatingsDistributionResponse> {
    return this.http
      .get<RatingsDistributionResponse>(
        `${environment.server_url}dashboard/ratings/distribution`
      )
      .pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

  // Combined dashboard data
  getDashboardSummary(): Observable<{
    activeCompanies: ActiveCompaniesResponse;
    activeDevelopers: ActiveDevelopersResponse;
    projectsByStatus: ProjectsByStatusResponse;
    reportsByStatus: ReportsByStatusResponse;
    totalCategories: TotalCategoriesResponse;
    adminsByStatus: AdminsByStatusResponse;
    ratingsDistribution: RatingsDistributionResponse;
  }> {
    return forkJoin({
      activeCompanies: this.getActiveCompaniesCount(),
      activeDevelopers: this.getActiveDevelopersCount(),
      projectsByStatus: this.getProjectsByStatus(),
      reportsByStatus: this.getReportsByStatus(),
      totalCategories: this.getTotalCategories(),
      adminsByStatus: this.getAdminsByStatus(),
      ratingsDistribution: this.getRatingsDistribution(),
    }).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
  }

getTotalFavoriteProjects(): Observable<TotalFavoritesResponse> {
  return this.http.get<TotalFavoritesResponse>(
    `${environment.server_url}dashboard/Totalfavorites/developer`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getMyRatingsDistribution(): Observable<MyRatingsDistributionResponse> {
  return this.http.get<MyRatingsDistributionResponse>(
    `${environment.server_url}dashboard/Myratings/distribution`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getMyAverageRating(): Observable<MyAverageRatingResponse> {
  return this.http.get<MyAverageRatingResponse>(
    `${environment.server_url}dashboard/Myaveragerating`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getMyProjectsByStatus(): Observable<MyProjectsByStatusResponse> {
  return this.http.get<MyProjectsByStatusResponse>(
    `${environment.server_url}dashboard/Myprojectsbystatus`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getMyProjectsWithApplicantCount(): Observable<MyProjectsWithApplicantsResponse> {
  return this.http.get<MyProjectsWithApplicantsResponse>(
    `${environment.server_url}dashboard/Myprojectswithapplicantcount`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getTotalProjectApplications(): Observable<TotalApplicationsResponse> {
  return this.http.get<TotalApplicationsResponse>(
    `${environment.server_url}dashboard/ApplicationsDeveloper`
  ).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

// Métodos combinados para simplificar el consumo
getDeveloperDashboard(): Observable<{
  totalApplications: TotalApplicationsResponse;
  totalFavorites: TotalFavoritesResponse;
  myRatingsDistribution: MyRatingsDistributionResponse;
  myAverageRating: MyAverageRatingResponse;
}> {
  return forkJoin({
    totalApplications: this.getTotalProjectApplications(),
    totalFavorites: this.getTotalFavoriteProjects(),
    myRatingsDistribution: this.getMyRatingsDistribution(),
    myAverageRating: this.getMyAverageRating(),
  }).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}

getCompanyDashboard(): Observable<{
  myProjectsByStatus: MyProjectsByStatusResponse;
  myProjectsWithApplicants: MyProjectsWithApplicantsResponse;
  myRatingsDistribution: MyRatingsDistributionResponse;
  myAverageRating: MyAverageRatingResponse;
}> {
  return forkJoin({
    myProjectsByStatus: this.getMyProjectsByStatus(),
    myProjectsWithApplicants: this.getMyProjectsWithApplicantCount(),
    myRatingsDistribution: this.getMyRatingsDistribution(),
    myAverageRating: this.getMyAverageRating(),
  }).pipe(catchError((err) => this.handlerErrorSrv.handlerError(err)));
}
}
