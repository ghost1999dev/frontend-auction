// src/app/core/services/favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HandlerErrorService } from './handler-error.service';
import { catchError } from 'rxjs/operators';
import { CreateFavoriteProjectRequest, CreateFavoriteProjectResponse, DeleteFavoriteProjectResponse, FavoriteProjectResponse } from '../models/favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  constructor(
    private http: HttpClient,
    private handlerErrorService: HandlerErrorService
  ) { }

  getAllFavorites(developerId: number): Observable<FavoriteProjectResponse> {
    return this.http.get<FavoriteProjectResponse>(`${environment.server_url}favorite-projects/get/all/${developerId}`)
      .pipe(
        catchError(err => this.handlerErrorService.handlerError(err))
      );
  }

  addToFavorites(data: CreateFavoriteProjectRequest): Observable<CreateFavoriteProjectResponse> {
    return this.http.post<CreateFavoriteProjectResponse>(`${environment.server_url}favorite-projects/create`, data)
      .pipe(
        catchError(err => this.handlerErrorService.handlerError(err))
      );
  }

  removeFromFavorites(favoriteId: number): Observable<DeleteFavoriteProjectResponse> {
    return this.http.delete<DeleteFavoriteProjectResponse>(`${environment.server_url}favorite-projects/delete/${favoriteId}`)
      .pipe(
        catchError(err => this.handlerErrorService.handlerError(err))
      );
  }
}