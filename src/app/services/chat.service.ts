import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private connection: signalR.HubConnection | null = null;
  
  private messageReceivedSource = new Subject<{ senderId: number; content: string; timestamp: string }>();
  messageReceived$ = this.messageReceivedSource.asObservable();

  private messageSentSource = new Subject<any>();
  messageSent$ = this.messageSentSource.asObservable();

  private readonly apiUrl = '/api/chat';

  async startConnection() {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found for SignalR connection');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5109/chatHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveMessage', (senderId: number, content: string, timestamp: string) => {
      this.messageReceivedSource.next({ senderId, content, timestamp });
    });

    this.connection.on('MessageSent', (message: any) => {
      this.messageSentSource.next(message);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected.');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }
  }

  async sendMessage(receiverId: number, content: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', receiverId, content);
    } else {
      console.error('SignalR not connected. State:', this.connection?.state);
    }
  }

  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  sendAsset(senderId: number, receiverId: number, assetId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-asset`, { senderId, receiverId, assetId });
  }

  reportMessage(payload: { messageId: number; reporterId: number; reason: string; details?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/report`, payload);
  }
}
