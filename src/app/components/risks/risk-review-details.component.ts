import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RiskReviewDto } from '../../models/risk-review.dto';
import { RiskService } from '../../services/risk.service';
import { RiskReviewService } from '../../services/risk-review.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-risk-review-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="details-container" *ngIf="review">
      <div class="header">
        <h2>Review Details</h2>
        <button mat-icon-button (click)="close.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="content">
        <section class="review-section">
          <h3>Review Status</h3>
          <mat-chip-set>
            <mat-chip [ngClass]="review.REVIEW_STATUS.toLowerCase().replace(/_/g, '-')" selected>
              {{ review.REVIEW_STATUS }}
            </mat-chip>
          </mat-chip-set>
          
          <div class="info-row" *ngIf="review.REVIEWER_ABBR">
            <label>Reviewer:</label>
            <span>{{ review.REVIEWER_ABBR }}</span>
          </div>

          <div class="info-row" *ngIf="!review.REVIEWER_ABBR">
            <label>Reviewer:</label>
            <a href="javascript:void(0)" (click)="assignToMe()" class="assign-link">Assign to me</a>
          </div>

          <div class="info-row">
            <label>Created At:</label>
            <span>{{ review.CREATED_AT | date:'medium' }}</span>
          </div>

          <div class="notes-box" *ngIf="review.REVIEW_NOTES">
            <label>Notes:</label>
            <p>{{ review.REVIEW_NOTES }}</p>
          </div>
        </section>

        <mat-divider></mat-divider>

        <section class="risk-section">
          <div class="section-header-with-loader">
            <h3>Associated Risk</h3>
            <mat-progress-bar mode="indeterminate" *ngIf="loadingRisk"></mat-progress-bar>
          </div>

          <div *ngIf="riskDetails" class="risk-info">
            <div class="info-row">
              <label>Title:</label>
              <span>{{ riskDetails.mongo?.title || riskDetails.title }}</span>
            </div>
            <div class="info-row">
              <label>Impact:</label>
              <mat-chip-set>
                <mat-chip [color]="getImpactColor(riskDetails.mongo?.impact || riskDetails.impact)" selected>
                  {{ riskDetails.mongo?.impact || riskDetails.impact }}
                </mat-chip>
              </mat-chip-set>
            </div>
            <div class="info-row">
              <label>Likelihood:</label>
              <span>{{ riskDetails.mongo?.likelihood || riskDetails.likelihood }}</span>
            </div>
            <div class="info-row">
              <label>Category:</label>
              <span>{{ riskDetails.mongo?.category || riskDetails.category }}</span>
            </div>
            <div class="description-box">
              <label>Description:</label>
              <p>{{ riskDetails.mongo?.description || riskDetails.description || 'No description.' }}</p>
            </div>
          </div>

          <div *ngIf="!loadingRisk && !riskDetails" class="error-msg">
            Failed to load risk details.
          </div>
        </section>

        <mat-divider></mat-divider>

        <section class="comments-section">
          <h3>Comments</h3>
          
          <div class="comments-list" *ngIf="review.comments && review.comments.length > 0">
            <div class="comment-item" *ngFor="let comment of review.comments">
              <div class="comment-header">
                <span class="user-abbr">{{ comment.user_abbr }}</span>
                <span class="comment-date">{{ comment.created_at | date:'short' }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
          <p class="no-comments" *ngIf="!review.comments || review.comments.length === 0">No comments yet.</p>

          <div class="add-comment">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Add a comment</mat-label>
              <textarea matInput [(ngModel)]="newComment" placeholder="Write your comment here..." rows="3"></textarea>
            </mat-form-field>
            <div class="actions">
              <button mat-flat-button color="primary" [disabled]="!newComment.trim() || addingComment" (click)="addComment()">
                <mat-icon *ngIf="!addingComment">send</mat-icon>
                <span *ngIf="!addingComment">Add Comment</span>
                <span *ngIf="addingComment">Adding...</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="no-selection" *ngIf="!review">
      <mat-icon>assessment</mat-icon>
      <p>Select a review to see details</p>
    </div>
  `,
  styles: [`
    .details-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e6e8eb;
      h2 { margin: 0; font-size: 1.25rem; }
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }
    mat-divider {
      margin: 32px 0;
    }
    section {
      margin-bottom: 32px;
      h3 { margin-top: 0; margin-bottom: 20px; color: #5f6368; font-size: 0.9rem; text-transform: uppercase; }
    }
    .info-row {
      display: flex;
      margin-bottom: 12px;
      label { width: 100px; color: #70757a; font-size: 0.85rem; }
      span { flex: 1; font-weight: 500; }
    }
    .notes-box, .description-box {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      label { display: block; margin-bottom: 8px; color: #70757a; font-size: 0.85rem; }
      p { margin: 0; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; }
    }
    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9aa0a6;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    }
    .ready-for-review { background-color: #e3f2fd !important; color: #1967d2 !important; }
    .in-review { background-color: #fff9c4 !important; color: #f9a825 !important; }
    .needs-changes { background-color: #ffcdd2 !important; color: #c62828 !important; }
    .done { background-color: #c8e6c9 !important; color: #2e7d32 !important; }

    .section-header-with-loader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      h3 { margin-bottom: 0; }
      mat-progress-bar { width: 100px; }
    }
    .risk-info { margin-top: 16px; }
    .error-msg { color: #c62828; font-size: 0.85rem; }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }
    .comment-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1967d2;
    }
    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      .user-abbr { font-weight: bold; font-size: 0.8rem; color: #1967d2; }
      .comment-date { font-size: 0.75rem; color: #70757a; }
    }
    .comment-content { margin: 0; font-size: 0.9rem; white-space: pre-wrap; }
    .no-comments { color: #70757a; font-style: italic; margin-bottom: 24px; }
    .add-comment {
      margin-top: 24px;
      .full-width { width: 100%; }
      .actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    }
    .assign-link {
      color: #1a73e8;
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }
  `]
})
export class RiskReviewDetailsComponent implements OnChanges {
  @Input() review: RiskReviewDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() reviewUpdated = new EventEmitter<void>();

  private readonly riskService = inject(RiskService);
  private readonly riskReviewService = inject(RiskReviewService);
  private readonly authService = inject(AuthService);
  
  riskDetails: any = null;
  loadingRisk = false;
  newComment = '';
  addingComment = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['review'] && this.review) {
      this.loadRiskDetails(this.review.RISK_ID);
    }
  }

  loadRiskDetails(riskId: number): void {
    this.loadingRisk = true;
    this.riskDetails = null;
    this.riskService.getRiskById(riskId.toString()).subscribe({
      next: (data) => {
        this.riskDetails = data;
        this.loadingRisk = false;
      },
      error: () => {
        this.loadingRisk = false;
      }
    });
  }

  addComment(): void {
    if (!this.review?.REVIEW_ID || !this.newComment.trim()) return;

    this.addingComment = true;
    const user = this.authService.getUser();
    
    let userAbbr = 'UNKNOWN';
    if (user) {
      if (user.firstname && user.surname) {
        userAbbr = (user.firstname[0] + user.surname).toUpperCase();
      } else if (user.username) {
        userAbbr = user.username.toUpperCase();
      }
    }

    this.riskReviewService.addComment(this.review.REVIEW_ID, userAbbr, this.newComment).subscribe({
      next: (comment) => {
        if (this.review) {
          if (!this.review.comments) {
            this.review.comments = [];
          }
          this.review.comments.push(comment);
        }
        this.newComment = '';
        this.addingComment = false;
      },
      error: (err) => {
        console.error('Failed to add comment', err);
        this.addingComment = false;
      }
    });
  }

  assignToMe(): void {
    if (!this.review?.REVIEW_ID) return;

    const user = this.authService.getUser();
    if (!user) return;

    this.riskReviewService.updateReviewStatus(this.review.REVIEW_ID, {
      status: this.review.REVIEW_STATUS, // Keep current status
      reviewerId: Number(user.userId)
    }).subscribe({
      next: () => {
        this.reviewUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to assign review', err);
      }
    });
  }

  getImpactColor(impact: string): string {
    switch (impact?.toLowerCase()) {
      case 'critical': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      default: return '';
    }
  }
}
