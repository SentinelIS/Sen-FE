import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UserService, UserDto } from '../../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReportMessageDialogComponent } from './report-message-dialog.component';

interface Conversation {
  userId: number;
  user?: UserDto;
  lastMessage?: string;
  isExternal?: boolean;
}

interface Message {
  id?: number;
  MSG_ID?: number;
  senderId: number;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  conversations = signal<Conversation[]>([]);
  searchResults = signal<Conversation[]>([]);
  activeConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  
  searchQuery = '';
  isSearching = false;
  newMessage = '';

  private subscriptions = new Subscription();

  async ngOnInit() {
    await this.chatService.startConnection();
    this.loadConversations();

    this.subscriptions.add(
      this.chatService.messageReceived$.subscribe((msg) => {
        if (this.activeConversation()?.userId === msg.senderId) {
          this.messages.update((prev) => [...prev, msg]);
        } else {
          this.loadConversations();
        }
      })
    );

    this.subscriptions.add(
      this.chatService.messageSent$.subscribe((msg) => {
        this.messages.update((prev) => [...prev, msg]);
      })
    );
  }

  ngOnDestroy() {
    this.chatService.stopConnection();
    this.subscriptions.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }

  loadConversations() {
    this.http.get<number[]>('http://localhost:5109/api/messages/conversations').subscribe({
      next: (ids) => {
        const currentUser = this.authService.getUser();
        const currentUserCompanyId = currentUser?.companyId;

        const convs: Conversation[] = ids.map(id => ({ userId: id }));
        this.conversations.set(convs);
        
        convs.forEach(conv => {
          this.userService.getUserById(conv.userId).subscribe(user => {
            this.conversations.update(current => 
              current.map(c => c.userId === conv.userId ? { 
                ...c, 
                user, 
                isExternal: user.companyId !== currentUserCompanyId 
              } : c)
            );
          });
        });
      },
      error: (err) => console.error('Error loading conversations', err)
    });
  }

  onSearch() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.isSearching = false;
      this.searchResults.set([]);
      return;
    }

    const currentUser = this.authService.getUser();
    if (!currentUser?.companyId) return;

    this.isSearching = true;
    
    forkJoin({
      internal: this.userService.searchInternalUsers(currentUser.companyId),
      external: this.userService.searchExternalUsers(currentUser.companyId)
    }).subscribe({
      next: (results) => {
        const internalResults: Conversation[] = results.internal
          .filter(u => u.userId !== Number(currentUser.userId) && 
            this.userMatchesSearch(u, query))
          .map(u => ({ userId: u.userId, user: u, isExternal: false }));

        const externalResults: Conversation[] = results.external
          .filter(u => this.userMatchesSearch(u, query))
          .map(u => ({ userId: u.userId, user: u, isExternal: true }));

        this.searchResults.set([...internalResults, ...externalResults]);
      },
      error: (err) => {
        console.error('Search error', err);
        this.isSearching = false;
      }
    });
  }

  private userMatchesSearch(user: UserDto, query: string): boolean {
    return [user.firstname, user.surname, user.username]
      .some(value => (value ?? '').toLowerCase().includes(query));
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.searchResults.set([]);
  }

  selectConversation(conv: Conversation) {
    this.activeConversation.set(conv);
    this.loadHistory(conv.userId);
    
    // If we select from search results, clear search to show sidebar normally
    if (this.isSearching) {
      this.clearSearch();
    }
  }

  loadHistory(userId: number) {
    this.http.get<Message[]>(`http://localhost:5109/api/messages/history/${userId}`).subscribe({
      next: (history) => {
        const mappedHistory = (history || []).map(msg => ({
          ...msg,
          id: msg.id || msg.MSG_ID
        }));
        this.messages.set(mappedHistory);
      },
      error: (err) => console.error('Error loading history', err)
    });
  }

  sendMessage() {
    const active = this.activeConversation();
    if (active && this.newMessage.trim()) {
      this.chatService.sendMessage(active.userId, this.newMessage);
      this.newMessage = '';
    }
  }

  openReportDialog(msg: Message): void {
    const messageId = msg.id || msg.MSG_ID;
    if (!messageId) {
      this.snackBar.open('Cannot report this message (Missing ID).', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ReportMessageDialogComponent, {
      width: '400px',
      data: { messageId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.submitReport(messageId, result.reason, result.details);
      }
    });
  }

  private submitReport(messageId: number, reason: string, details?: string): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    this.chatService.reportMessage({
      messageId,
      reporterId: Number(currentUser.userId),
      reason,
      details
    }).subscribe({
      next: () => {
        this.snackBar.open('Report submitted successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error reporting message', err);
        this.snackBar.open('Failed to submit report.', 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
