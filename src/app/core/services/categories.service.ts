import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { CategoryResponse, CategoryResponseAddUpdate, CategoryResponseById, CreateCategory, UpdateCategory } from "../models/categories";
import { Category } from "../models/projects";
import { HandlerErrorService } from "./handler-error.service";
import { NotificationService } from "./notification.service";

@Injectable({
    providedIn: 'root'
  })
  export class CategoryService {
  
    constructor(
      private http: HttpClient,
      private notificationServices: NotificationService,
      private HandlerErrorSrv: HandlerErrorService
    ) { }
  
    getAllCategories(): Observable<Category[]> {
      return this.http.get<CategoryResponse>(`${environment.server_url}categories/show/all`)
        .pipe(
          map(response => response.categories),
          catchError((err) => this.HandlerErrorSrv.handlerError(err))
        );
    }
  
    getCategoryById(id: number): Observable<Category> {
      return this.http.get<CategoryResponseById>(`${environment.server_url}categories/show/${id}`)
        .pipe(
          map(response => response.category),
          catchError((err) => this.HandlerErrorSrv.handlerError(err))
        );
    }
  
    createCategory(data: CreateCategory): Observable<Category> {
      return this.http.post<CategoryResponseById>(`${environment.server_url}categories/create`, data)
        .pipe(
          map(response => response.category),
          catchError((err) => this.HandlerErrorSrv.handlerError(err))
        );
    }
  
    updateCategory(id: number, data: UpdateCategory): Observable<Category> {
      return this.http.put<CategoryResponseAddUpdate>(`${environment.server_url}categories/update/${id}`, data)
        .pipe(
          map(response => response.category),
          catchError((err) => this.HandlerErrorSrv.handlerError(err))
        );
    }
  
    deleteCategory(id: number): Observable<{ message: string }> {
      return this.http.delete<{ message: string }>(`${environment.server_url}categories/delete/${id}`)
        .pipe(
          catchError((err) => this.HandlerErrorSrv.handlerError(err))
        );
    }
  }