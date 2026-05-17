import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RiskDto } from '../../models/risk.dto';

@Component({
  selector: 'app-create-risk-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
  ],
  template: `
    <h2 mat-dialog-title>Create New Risk</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="data.title" placeholder="Risk Title" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="data.category" required>
            <mat-option value="cybersecurity">Cybersecurity</mat-option>
            <mat-option value="compliance">Compliance</mat-option>
            <mat-option value="financial">Financial</mat-option>
            <mat-option value="operational">Operational</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Impact</mat-label>
          <mat-select [(ngModel)]="data.impact" required>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
            <mat-option value="critical">Critical</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Likelihood</mat-label>
          <mat-select [(ngModel)]="data.likelihood" required>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
            <mat-option value="very high">Very High</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="data.status" required>
            <mat-option value="identified">Identified</mat-option>
            <mat-option value="assessed">Assessed</mat-option>
            <mat-option value="mitigated">Mitigated</mat-option>
            <mat-option value="accepted">Accepted</mat-option>
            <mat-option value="closed">Closed</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Treatment</mat-label>
          <mat-select [(ngModel)]="data.treatment" required>
            <mat-option value="accept">Accept</mat-option>
            <mat-option value="mitigate">Mitigate</mat-option>
            <mat-option value="transfer">Transfer</mat-option>
            <mat-option value="avoid">Avoid</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="slider-container">
          <label>Inherent Risk Score: {{ data.inherent_risk_score }}</label>
          <mat-slider min="1" max="25" step="1" discrete>
            <input matSliderThumb [(ngModel)]="data.inherent_risk_score">
          </mat-slider>
        </div>

        <div class="slider-container">
          <label>Residual Risk Score: {{ data.residual_risk_score }}</label>
          <mat-slider min="1" max="25" step="1" discrete>
            <input matSliderThumb [(ngModel)]="data.residual_risk_score">
          </mat-slider>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="data.description" placeholder="Description" required></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data" [disabled]="!isFormValid()">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 8px;
    }
    .full-width {
      grid-column: span 2;
    }
    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 4px;
      label {
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.6);
      }
      mat-slider {
        width: 100%;
      }
    }
    mat-form-field {
      width: 100%;
    }
    textarea {
      min-height: 80px;
    }
  `]
})
export class CreateRiskDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateRiskDialogComponent>);
  readonly data = inject<RiskDto>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    return !!(
      this.data.title &&
      this.data.category &&
      this.data.impact &&
      this.data.likelihood &&
      this.data.status &&
      this.data.description &&
      this.data.inherent_risk_score >= 1 &&
      this.data.inherent_risk_score <= 25 &&
      this.data.residual_risk_score >= 1 &&
      this.data.residual_risk_score <= 25 &&
      this.data.treatment
    );
  }
}
