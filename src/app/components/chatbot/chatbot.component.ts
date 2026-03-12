import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatbotRequest } from '../../models/chatbot-request.dto';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  showChat = false;
  messages: { text: string; sender: 'user' | 'bot' }[] = [];
  userInput = '';

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, sender: 'user' });
      const request: ChatbotRequest = { question: this.userInput };
      this.chatbotService.askMimo(request).subscribe((response) => {
        this.messages.push({ text: response.answer, sender: 'bot' });
      });
      this.userInput = '';
    }
  }
}
