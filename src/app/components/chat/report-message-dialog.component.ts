import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-report-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Report Message</h2>
    <mat-dialog-content>
      <p>Why are you reporting this message?</p>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Reason</mat-label>
        <mat-select [(ngModel)]="report.reason" required>
          <mat-option value="Spam">Spam</mat-option>
          <mat-option value="Harassment">Harassment</mat-option>
          <mat-option value="Inappropriate Content">Inappropriate Content</mat-option>
          <mat-option value="Misinformation">Misinformation</mat-option>
          <mat-option value="Other">Other</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Details (Optional)</mat-label>
        <textarea matInput [(ngModel)]="report.details" placeholder="Provide more context..." rows="4"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="report" [disabled]="!report.reason">
        Submit Report
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-form-field {
      margin-top: 8px;
    }
  `]
})
export class ReportMessageDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ReportMessageDialogComponent>);
  readonly data = inject<{ messageId: number }>(MAT_DIALOG_DATA);

  report = {
    reason: '',
    details: ''
  };

  onNoClick(): void {
    this.dialogRef.close();
  }
}
