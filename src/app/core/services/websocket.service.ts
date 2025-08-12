// src/app/core/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.server_url, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: false
    });
  }

  connect(token: string): void {
    this.socket.auth = { token };
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  joinAuctionRoom(auctionId: number): void {
    this.socket.emit('joinAuctionRoom', auctionId);
  }

  onNewBid(callback: (bid: any) => void): void {
    this.socket.on('new_bid', callback);
  }

  offNewBid(): void {
    this.socket.off('new_bid');
  }
}