import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { 
    catchError, 
    forkJoin, 
    map, 
    Observable, 
    shareReplay, 
    throwError 
} from 'rxjs';
import { 
    RatingResponse, 
    RatingResponseById, 
    RatingAverageResponse,
    PublicProfileResponse,
    CreateRatingRequest,
    UpdateRatingRequest,
    FilterRatingsParams,
    Rating
} from '../models/ratings';
import { environment } from 'src/environments/environment';
import { HandlerErrorService } from './handler-error.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private HandlerErrorSrv: HandlerErrorService,
  ) { }

  getAllRatings(params?: FilterRatingsParams): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(`${environment.server_url}ratings/show/all`, { params: { ...params } }).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getRatingById(id: number): Observable<Rating> {
    return this.http.get<RatingResponseById>(`${environment.server_url}ratings/show/${id}`).pipe(
        map(response => response.rating),
        shareReplay(1),
        catchError((err) => this.HandlerErrorSrv.handlerError(err))
      );
  }

  createRating(ratingData: CreateRatingRequest): Observable<Rating> {
    return this.http.post<RatingResponseById>(`${environment.server_url}ratings/create`, ratingData).pipe(
      map(response => {
        return response.rating;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  updateRating(id: number, ratingData: UpdateRatingRequest): Observable<Rating> {
    return this.http.put<RatingResponseById>(`${environment.server_url}ratings/update/${id}`, ratingData).pipe(
      map(response => {
        return response.rating;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  deleteRating(id: number): Observable<any> {
    return this.http.delete(`${environment.server_url}ratings/delete/${id}`).pipe(
      map(response => {
        return response;
      }),
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  // Rating Statistics Operations
  getAverageRatingByDeveloper(developerId: number): Observable<RatingAverageResponse> {
    return this.http.get<RatingAverageResponse>(`${environment.server_url}ratings/getPromDeveloper/${developerId}`).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getAverageRatingByCompany(companyId: number): Observable<RatingAverageResponse> {
    return this.http.get<RatingAverageResponse>(`${environment.server_url}ratings/getPromCompany/${companyId}`).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getGlobalAverageRatingByDeveloper(): Observable<RatingAverageResponse> {
    return this.http.get<RatingAverageResponse>(`${environment.server_url}ratings/getGlobalPromDeveloper`).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getGlobalAverageRatingByCompany(): Observable<RatingAverageResponse> {
    return this.http.get<RatingAverageResponse>(`${environment.server_url}ratings/getGlobalPromCompany`).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }

  getPublicProfile(userId: number, filterBy?: string): Observable<PublicProfileResponse> {
    const params: any = {};
    if (filterBy) params.filterBy = filterBy;
    
    return this.http.get<PublicProfileResponse>(`${environment.server_url}ratings/getPublicProfile/${userId}`, { params }).pipe(
      catchError((err) => this.HandlerErrorSrv.handlerError(err))
    );
  }
}