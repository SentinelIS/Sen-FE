import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatbotRequest } from '../models/chatbot-request.dto';
import { ChatbotResponse } from '../models/chatbot-response.dto';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'http://localhost:3000/mimo/chatbot';

  constructor(private http: HttpClient) {}

  askMimo(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(this.apiUrl, request);
  }
}
