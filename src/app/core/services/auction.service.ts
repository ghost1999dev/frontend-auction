import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
    Auction, 
    AuctionResponse, 
    AuctionResponseById, 
    CreateAuction, 
    UpdateAuction 
} from '../models/auctions';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HandlerErrorService } from './handler-error.service';

@Injectable({
    providedIn: 'root'
})
export class AuctionService {

    constructor(
        private http: HttpClient,
        private notificationService: NotificationService,
        private HandlerErrorSrv: HandlerErrorService,
    ) { }

    getAuctions(): Observable<Auction[]> {
        return this.http.get<AuctionResponse>(`${environment.server_url}auctions/show/all`).pipe(
                map(response => response.data),
                shareReplay(1)
            );
    }

    getAuctionById(id: number): Observable<Auction> {
        return this.http.get<AuctionResponseById>(`${environment.server_url}auctions/show/id/${id}`).pipe(
            map(response => response.data),
            shareReplay(1)
        );
    }

    createAuction(data: CreateAuction): Observable<Auction> {
        return this.http.post<AuctionResponseById>(`${environment.server_url}auctions/create`, data).pipe(
            map(response => {
                this.notificationService.showSuccessCustom('Subasta creada exitosamente');
                return response.auction;
            }),
            catchError(err => this.HandlerErrorSrv.handlerError(err))
        );
    }

    updateAuction(id: number, data: UpdateAuction): Observable<Auction> {
        return this.http.put<AuctionResponseById>(`${environment.server_url}auctions/update/${id}`, data).pipe(
            map(response => {
                this.notificationService.showSuccessCustom('Subasta actualizada exitosamente');
                return response.auction;
            }),
            catchError(err => this.HandlerErrorSrv.handlerError(err))
        );
    }

    deleteAuction(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${environment.server_url}auctions/delete/${id}`).pipe(
            map(response => {
                this.notificationService.showSuccessCustom('Subasta eliminada exitosamente');
                return response;
            }),
            catchError(err => this.HandlerErrorSrv.handlerError(err))
        );
    }
}