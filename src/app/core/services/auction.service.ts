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

@Injectable({
    providedIn: 'root'
})
export class AuctionService {
    private auctionsCache: Observable<Auction[]> | null = null;
    private auctionCache = new Map<number, Observable<Auction>>();

    constructor(
        private http: HttpClient,
        private notificationService: NotificationService
    ) { }

    getAuctions(): Observable<Auction[]> {
        if (!this.auctionsCache) {
            this.auctionsCache = this.http.get<AuctionResponse>(`${environment.server_url}auctions/show/all`).pipe(
                map(response => response.data),
                shareReplay(1)
            );
        }
        return this.auctionsCache;
    }

    getAuctionById(id: number): Observable<Auction> {
        if (!this.auctionCache.has(id)) {
            const auction$ = this.http.get<AuctionResponseById>(`${environment.server_url}auctions/show/id/${id}`).pipe(
                map(response => response.data),
                shareReplay(1)
            );
            this.auctionCache.set(id, auction$);
        }
        return this.auctionCache.get(id)!;
    }

    clearCache(): void {
        this.auctionsCache = null;
        this.auctionCache.clear();
    }

    clearAuctionCache(id: number): void {
        this.auctionCache.delete(id);
    }

    createAuction(data: CreateAuction): Observable<Auction> {
        return this.http.post<AuctionResponseById>(`${environment.server_url}auctions/create`, data).pipe(
            map(response => {
                this.clearCache();
                this.notificationService.showSuccessCustom('Subasta creada exitosamente');
                return response.auction;
            }),
            catchError(err => this.handleError(err))
        );
    }

    updateAuction(id: number, data: UpdateAuction): Observable<Auction> {
        return this.http.put<AuctionResponseById>(`${environment.server_url}auctions/update/${id}`, data).pipe(
            map(response => {
                this.clearCache();
                this.clearAuctionCache(id);
                this.notificationService.showSuccessCustom('Subasta actualizada exitosamente');
                return response.auction;
            }),
            catchError(err => this.handleError(err))
        );
    }

    deleteAuction(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${environment.server_url}auctions/delete/${id}`).pipe(
            map(response => {
                this.clearCache();
                this.clearAuctionCache(id);
                this.notificationService.showSuccessCustom('Subasta eliminada exitosamente');
                return response;
            }),
            catchError(err => this.handleError(err))
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';
        
        if (error.error && error.error.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.notificationService.showErrorCustom(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}