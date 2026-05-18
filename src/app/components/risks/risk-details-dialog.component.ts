import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RiskReviewService } from '../../services/risk-review.service';

@Component({
  selector: 'app-risk-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title class="details-title">
      <mat-icon color="primary">assessment</mat-icon>
      Risk Details: {{ data.mongo?.title || data.title }}
    </h2>
    <mat-dialog-content class="details-content">
      <div class="details-grid">
        <div class="detail-item">
          <label>ID</label>
          <span>{{ data.risk_id }}</span>
        </div>
        <div class="detail-item">
          <label>Status</label>
          <mat-chip-set>
            <mat-chip [color]="getStatusColor(data.mongo?.status || data.status)" selected>
              {{ data.mongo?.status || data.status }}
            </mat-chip>
          </mat-chip-set>
        </div>
        <div class="detail-item">
          <label>Impact</label>
          <mat-chip-set>
            <mat-chip [color]="getImpactColor(data.mongo?.impact || data.impact)" selected>
              {{ data.mongo?.impact || data.impact }}
            </mat-chip>
          </mat-chip-set>
        </div>
        <div class="detail-item">
          <label>Likelihood</label>
          <span>{{ data.mongo?.likelihood || data.likelihood }}</span>
        </div>
        <div class="detail-item">
          <label>Category</label>
          <span>{{ data.mongo?.category || data.category }}</span>
        </div>
        <div class="detail-item">
          <label>Owner</label>
          <span>{{ data.username || data.mysql?.USER_CR_ID }}</span>
        </div>
      </div>

      <mat-divider class="my-16"></mat-divider>

      <div class="description-section">
        <label>Description</label>
        <p>{{ data.mongo?.description || data.description || 'No description provided.' }}</p>
      </div>

      <mat-divider class="my-16"></mat-divider>

      <div class="metadata-grid">
        <div class="metadata-item">
          <label>Created At</label>
          <span>{{ data.mongo?.created_at | date:'medium' }}</span>
        </div>
        <div class="metadata-item">
          <label>Last Updated</label>
          <span>{{ (data.mongo?.updated_at || data.mysql?.LAST_UPD) | date:'medium' }}</span>
        </div>
        <div class="metadata-item">
          <label>Company ID</label>
          <span>{{ data.companyId || data.mysql?.COMP_ID }}</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="accent" (click)="requestReview()">Request Review</button>
      <button mat-raised-button color="primary" (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .details-content {
      padding-top: 10px;
    }
    .details-grid, .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }
    .detail-item, .metadata-item, .description-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label {
        font-size: 0.8rem;
        color: #6b7280;
        text-transform: uppercase;
        font-weight: 500;
      }
      span, p {
        font-size: 1rem;
        color: #111827;
      }
    }
    .description-section p {
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .my-16 { margin: 16px 0; }
  `]
})
export class RiskDetailsDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RiskDetailsDialogComponent>);
  private readonly reviewService = inject(RiskReviewService);
  private readonly snackBar = inject(MatSnackBar);

  close(): void {
    this.dialogRef.close();
  }

  requestReview(): void {
    const payload = {
      riskId: this.data.risk_id,
      companyId: this.data.companyId || this.data.mysql?.COMP_ID,
      notes: 'Bitte dieses Risiko prüfen.'
    };

    this.reviewService.createRiskReview(payload).subscribe({
      next: () => {
        this.snackBar.open('Review requested successfully', 'Close', { duration: 3000 });
        this.close();
      },
      error: (err) => {
        this.snackBar.open('Failed to request review: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  getImpactColor(impact: string): string {
    switch (impact) {
      case 'critical': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      default: return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'mitigated':
      case 'closed': return 'primary';
      case 'critical': return 'warn';
      default: return '';
    }
  }
}
