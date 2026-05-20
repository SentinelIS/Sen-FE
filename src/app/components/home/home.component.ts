import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="content-wrapper">
        <mat-card class="hero-card">
          <mat-card-header>
            <mat-card-title>Welcome to Poseyeon</mat-card-title>
            <mat-card-subtitle>Your open-source, all-in-one business platform</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Poseyeon provides a comprehensive platform for managing your company's assets, assessing risks, and ensuring compliance across various frameworks.</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-raised-button color="primary" routerLink="/dashboard">Go to Dashboard</button>
          </mat-card-actions>
        </mat-card>

        <section class="launch-section">
          <h2 class="section-title">Launchpad</h2>
          <div class="app-grid">
            <mat-card class="app-card" routerLink="/chat">
              <mat-card-content>
                <img src="/mimo-chat.svg" alt="Chat" class="app-image" />
                <span class="app-name">Chat</span>
              </mat-card-content>
            </mat-card>

            <mat-card class="app-card">
              <mat-card-content>
                <img src="/mimo-custom.svg" alt="CxEngine" class="app-image" />
                <span class="app-name">CxEngine</span>
              </mat-card-content>
            </mat-card>

            <mat-card class="app-card">
              <mat-card-content>
                <img src="/mimo-documentation.svg" alt="CognetaKB" class="app-image" />
                <span class="app-name">CognetaKB</span>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      justify-content: center;
      padding: 48px 24px;
      min-height: 80vh;
    }
    .content-wrapper {
      max-width: 1000px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }
    .hero-card {
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .launch-section {
      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #3c4043;
        margin-bottom: 24px;
      }
    }
    .app-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
    }
    .app-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 20px;
      text-align: center;
      padding: 40px 24px;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important;
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 0 !important;
      }
    }
    .app-image {
      width: 150px;
      height: 150px;
      object-fit: contain;
    }
    .app-name {
      font-weight: 600;
      color: #3c4043;
      font-size: 1.2rem;
    }
      `]
      })
      export class HomeComponent {}
