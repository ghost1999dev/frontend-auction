import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HandlerErrorService } from './handler-error.service';
import { NotificationService } from './notification.service';
import { 
  BidCreate, 
  BidResponse, 
  BidUpdate, 
  AuctionResultsResponse 
} from '../models/bids';

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
  createBid(data: BidCreate): Observable<BidResponse> {
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
   * Obtiene pujas por subasta
   * @param auctionId ID de la subasta
   * @param developerId (Opcional) ID del desarrollador
   * @returns Observable con la lista de pujas
   */
  listBidsByAuction(auctionId: number, developerId?: number): Observable<BidResponse> {
    const params: any = {};
    if (developerId) params.developer_id = developerId.toString();
    
    return this.http.get<BidResponse>(`${environment.server_url}bids/show/by-auction/${auctionId}`, { params })
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

  /**
   * Finaliza una subasta y determina los ganadores
   * @param auctionId ID de la subasta
   * @returns Observable con la respuesta
   */
  finalizeAuction(auctionId: number): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${environment.server_url}bids/finalize`, { auction_id: auctionId })
      .pipe(
        map((res: BidResponse) => {
          this.notificationService.showSuccessCustom(res.message || 'Subasta finalizada exitosamente');
          return res;
        }),
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }

  /**
   * Obtiene los resultados de una subasta finalizada
   * @param auctionId ID de la subasta
   * @returns Observable con los resultados
   */
  getAuctionResults(auctionId: number): Observable<AuctionResultsResponse> {
    return this.http.get<AuctionResultsResponse>(`${environment.server_url}bids/resultados/${auctionId}`)
      .pipe(
        catchError((err) => this.handlerErrorService.handlerError(err))
      );
  }
}