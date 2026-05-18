import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink],
  template: `
    <div class="home-container">
      <mat-card class="hero-card">
        <mat-card-header>
          <mat-card-title>Welcome to Sentinel</mat-card-title>
          <mat-card-subtitle>Your Governance, Risk, and Compliance Hub</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Sentinel provides a comprehensive platform for managing your company's assets, assessing risks, and ensuring compliance across various frameworks.</p>
          <div class="features">
            <div class="feature">
              <h3>Risk Management</h3>
              <p>Identify, assess, and mitigate risks with ease.</p>
            </div>
            <div class="feature">
              <h3>Asset Tracking</h3>
              <p>Keep a clear inventory of all your critical assets.</p>
            </div>
            <div class="feature">
              <h3>Compliance</h3>
              <p>Map your controls to international frameworks like ISO 27001.</p>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-raised-button color="primary" routerLink="/dashboard">Go to Dashboard</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 24px;
    }
    .hero-card {
      max-width: 800px;
      width: 100%;
      padding: 24px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
    .feature h3 {
      color: #1a73e8;
      margin-bottom: 8px;
    }
  `]
})
export class HomeComponent {}
