import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HandlerErrorService } from './handler-error.service';
import { NotificationService } from './notification.service';
import { BidCreate, BidResponse, BidUpdate } from '../models/bids';

@Injectable({
  providedIn: 'root'
})
export class BidService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private handlerErrorService: HandlerErrorService
  ) { }

  /**
   * Crea una nueva puja
   * @param data Datos de la puja
   * @returns Observable con la respuesta
   */
  createBid(data: any): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${environment.server_url}bids/create`, data)
      .pipe(
        map((res: BidResponse) => {
          this.notificationService.showSuccessCustom(res.message || 'Puja creada exitosamente');
          return res;
        }),
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }

  /**
   * Obtiene todas las pujas, opcionalmente filtradas por auction_id o developer_id
   * @param filters Objeto con los filtros (auction_id, developer_id)
   * @returns Observable con la lista de pujas
   */
  listBids(filters?: { auction_id?: number, developer_id?: number }): Observable<BidResponse> {
    return this.http.get<BidResponse>(`${environment.server_url}bids/show/all`, { params: filters as any })
      .pipe(
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }

  /**
   * Obtiene una puja por su ID
   * @param id ID de la puja
   * @returns Observable con la puja encontrada
   */
  getBid(id: number): Observable<BidResponse> {
    return this.http.get<BidResponse>(`${environment.server_url}bids/${id}`)
      .pipe(
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }

  /**
   * Actualiza el monto de una puja
   * @param id ID de la puja
   * @param data Nuevo monto
   * @returns Observable con la puja actualizada
   */
  updateBid(id: number, data: BidUpdate): Observable<BidResponse> {
    return this.http.put<BidResponse>(`${environment.server_url}bids/update/${id}`, data)
      .pipe(
        map((res: BidResponse) => {
          this.notificationService.showSuccessCustom(res.message || 'Puja actualizada exitosamente');
          return res;
        }),
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }

  /**
   * Elimina una puja
   * @param id ID de la puja
   * @returns Observable con la respuesta
   */
  deleteBid(id: number): Observable<BidResponse> {
    return this.http.delete<BidResponse>(`${environment.server_url}bids/delete/${id}`)
      .pipe(
        map((res: BidResponse) => {
          this.notificationService.showSuccessCustom(res.message || 'Puja eliminada exitosamente');
          return res;
        }),
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }
}