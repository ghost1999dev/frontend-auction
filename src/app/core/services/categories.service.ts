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
      private handlerErrorService: HandlerErrorService
    ) { }
  
    getAllCategories(): Observable<Category[]> {
      return this.http.get<CategoryResponse>(`${environment.server_url}categories/show/all`)
        .pipe(
          map(response => response.categories),
          catchError((err) => this.handlerError(err))
        );
    }
  
    getCategoryById(id: number): Observable<Category> {
      return this.http.get<CategoryResponseById>(`${environment.server_url}categories/show/${id}`)
        .pipe(
          map(response => response.category),
          catchError((err) => this.handlerError(err))
        );
    }
  
    createCategory(data: CreateCategory): Observable<Category> {
      return this.http.post<CategoryResponseById>(`${environment.server_url}categories/create`, data)
        .pipe(
          map(response => response.category),
          catchError((err) => this.handlerError(err))
        );
    }
  
    updateCategory(id: number, data: UpdateCategory): Observable<Category> {
      return this.http.put<CategoryResponseAddUpdate>(`${environment.server_url}categories/update/${id}`, data)
        .pipe(
          map(response => response.category),
          catchError((err) => this.handlerError(err))
        );
    }
  
    deleteCategory(id: number): Observable<{ message: string }> {
      return this.http.delete<{ message: string }>(`${environment.server_url}categories/delete/${id}`)
        .pipe(
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
        case 403:
          this.notificationServices.showErrorCustom(err.error.message);
          break;
        case 404:
          this.notificationServices.showErrorCustom(err.error.message);
          break;
        case 500:
          this.notificationServices.showErrorCustom(err.error.message);
          break;
        default:
          this.notificationServices.showErrorCustom(err.message);
      }
  
      if (err.error.details && err.error.details.length > 0) {
        for (let i = 0; i < err.error.details.length; i++) {
          this.notificationServices.showErrorCustom(err.error.details[i]);
        }
      }
    
      return throwError(err);
    }
  }