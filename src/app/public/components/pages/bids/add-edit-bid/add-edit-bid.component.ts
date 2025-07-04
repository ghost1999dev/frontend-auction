import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Auction {
    id: number;
    project_id: number;
    company_id: number;
    bidding_started_at: string;
    bidding_deadline: string;
    status: number;
    project: Project;
}

interface Project {
    id: number;
    project_name: string;
    description: string;
    budget: number;
    company_id: number;
}

interface Bid {
    id: number;
    auction_id: number;
    developer_id: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    auction: Auction;
    developer: {
        id: number;
        user: {
            id: number;
            name: string;
            image: string;
        };
    };
}

@Component({
  selector: 'app-add-edit-bid',
  templateUrl: './add-edit-bid.component.html',
  styleUrls: ['./add-edit-bid.component.scss']
})
export class AddEditBidComponent implements OnInit {
    activeAuctions: Auction[] = [];
    selectedAuction: Auction | null = null;
    auctionBids: Bid[] = [];
    bidHistory: Bid[] = [];
    currentLowestBid: number = 0;
    quickBidAmounts: number[] = [];
    bidAmount: number | null = null;
    currentUserId: number = 1; // Cambiar según autenticación
    timeLeft: string = '';
    auctionEnded: boolean = false;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.loadMockData();
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }

    private updateTimer(): void {
        if (!this.selectedAuction) return;
        
        const now = new Date();
        const end = new Date(this.selectedAuction.bidding_deadline);
        const diff = end.getTime() - now.getTime();
        
        if (diff <= 0) {
            this.auctionEnded = true;
            this.timeLeft = 'Subasta finalizada';
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.timeLeft = `${hours}h ${minutes}m ${seconds}s`;
    }

    private loadMockData(): void {
        this.activeAuctions = [
            {
                id: 1,
                project_id: 1,
                company_id: 1,
                bidding_started_at: new Date().toISOString(),
                bidding_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: 1,
                project: {
                    id: 1,
                    project_name: 'Sistema de Gestión',
                    description: 'Sistema para gestión de inventarios',
                    budget: 15000,
                    company_id: 1
                }
            },
            {
                id: 2,
                project_id: 2,
                company_id: 1,
                bidding_started_at: new Date().toISOString(),
                bidding_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                status: 1,
                project: {
                    id: 2,
                    project_name: 'E-commerce',
                    description: 'Tienda online para venta de productos',
                    budget: 25000,
                    company_id: 1
                }
            }
        ];

        this.bidHistory = this.generateMockBids();
        this.selectAuction(this.activeAuctions[0]);
    }

    selectAuction(auction: Auction): void {
        this.selectedAuction = auction;
        this.auctionEnded = new Date(auction.bidding_deadline) < new Date();
        this.loadAuctionBids(auction.id);
        this.updateTimer();
    }

    private loadAuctionBids(auctionId: number): void {
        this.auctionBids = this.bidHistory
            .filter(bid => bid.auction_id === auctionId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        if (this.auctionBids.length > 0) {
            this.currentLowestBid = Math.min(...this.auctionBids.map(bid => bid.amount));
        } else {
            this.currentLowestBid = this.selectedAuction?.project.budget || 0;
        }
        
        this.generateQuickBidButtons();
    }

    private generateQuickBidButtons(): void {
        this.quickBidAmounts = [];
        const baseAmount = this.currentLowestBid;
        
        for (let i = 1; i <= 5; i++) {
            const calculatedAmount = baseAmount - (i * 100);
            if (calculatedAmount > 0) {
                this.quickBidAmounts.push(calculatedAmount);
            }
        }
    }

    placeBid(amount: number): void {
        if (!this.selectedAuction || amount <= 0) {
            alert('El monto de la oferta debe ser positivo');
            return;
        }
        
        if (this.auctionEnded) {
            alert('Esta subasta ha finalizado');
            return;
        }
        
        if (amount >= this.currentLowestBid) {
            alert('Tu oferta debe ser menor que la oferta actual más baja');
            return;
        }
        
        const newBid: Bid = {
            id: this.bidHistory.length + 1,
            auction_id: this.selectedAuction.id,
            developer_id: this.currentUserId,
            amount: amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            auction: this.selectedAuction,
            developer: {
                id: this.currentUserId,
                user: {
                    id: this.currentUserId,
                    name: 'Tú',
                    image: 'assets/images/default-user.png'
                }
            }
        };
        
        this.auctionBids.unshift(newBid);
        this.bidHistory.unshift(newBid);
        this.currentLowestBid = amount;
        this.generateQuickBidButtons();
        this.bidAmount = null;
    }

    private generateMockBids(): Bid[] {
        const mockBids: Bid[] = [];
        const developers = [
            {
                id: this.currentUserId,
                user: { id: this.currentUserId, name: 'Tú', image: 'assets/images/default-user.png' }
            },
            {
                id: 2,
                user: { id: 2, name: 'Desarrollador 2', image: 'https://randomuser.me/api/portraits/women/1.jpg' }
            }
        ];
        
        for (let i = 0; i < 10; i++) {
            const auction = this.activeAuctions[i % this.activeAuctions.length];
            const developer = developers[i % 2];
            const baseAmount = auction.project.budget;
            
            mockBids.push({
                id: i + 1,
                auction_id: auction.id,
                developer_id: developer.id,
                amount: baseAmount - (i * 500) - Math.floor(Math.random() * 200),
                createdAt: new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString(),
                updatedAt: new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString(),
                auction: auction,
                developer: developer
            });
        }
        
        return mockBids;
    }

    getStatusLabel(status: number): string {
        const statusMap: Record<number, string> = {
            0: 'Pendiente',
            1: 'Activa',
            2: 'Completada',
            3: 'Cancelada'
        };
        return statusMap[status] || 'Desconocido';
    }

    getStatusSeverity(status: any): any {
        const severityMap: Record<number, string> = {
            0: 'warning',
            1: 'success',
            2: 'info',
            3: 'danger'
        };
        return severityMap[status] || '';
    }

    filterUserBids(bids: Bid[]): Bid[] {
        return bids.filter(bid => bid.developer_id === this.currentUserId)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getValidQuickBidAmounts(): number[] {
        // Filtramos solo los montos mayores que 0
        return this.quickBidAmounts.filter(amount => amount > 0);
    }

}