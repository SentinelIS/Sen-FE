import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-report-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Report Details #{{ data.REPORT_ID }}</h2>
    <mat-dialog-content>
      <div class="detail-section">
        <label>Original Message:</label>
        <div class="message-content">{{ data.MSG_CONTENT }}</div>
      </div>
      
      <div class="detail-grid">
        <div>
          <label>Reporter:</label>
          <div>{{ data.REPORTER_ABBR }} (ID: {{ data.REPORTER_ID }})</div>
        </div>
        <div>
          <label>Sender:</label>
          <div>{{ data.SENDER_ABBR }} (ID: {{ data.SENDER_ID }})</div>
        </div>
        <div>
          <label>Reason:</label>
          <div class="reason-text">{{ data.REPORT_REASON }}</div>
        </div>
        <div>
          <label>Status:</label>
          <div>{{ data.REPORT_STATUS }}</div>
        </div>
      </div>

      <div class="detail-section" *ngIf="data.REPORT_DETAILS">
        <label>Additional Details:</label>
        <div class="details-box">{{ data.REPORT_DETAILS }}</div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .detail-section {
      margin-bottom: 20px;
    }
    label {
      font-weight: 600;
      color: #666;
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
    }
    .message-content {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #b3261e;
      font-style: italic;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .reason-text {
      color: #b3261e;
      font-weight: 600;
    }
    .details-box {
      background: #fff;
      border: 1px solid #e6e8eb;
      padding: 12px;
      border-radius: 8px;
      white-space: pre-wrap;
    }
  `]
})
export class ReportDetailsDialogComponent {
  readonly data = inject<any>(MAT_DIALOG_DATA);
}
