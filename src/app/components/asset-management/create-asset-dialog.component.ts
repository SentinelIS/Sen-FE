import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateAssetPayload } from '../../services/asset.service';

@Component({
  selector: 'app-create-asset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Create New Asset</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="data.name" placeholder="Asset Name" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <input matInput [(ngModel)]="data.type" placeholder="Asset Type" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="data.description" placeholder="Description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Classification</mat-label>
          <input matInput [(ngModel)]="data.classification" placeholder="Classification" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Location</mat-label>
          <input matInput [(ngModel)]="data.location" placeholder="Location" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Owner</mat-label>
          <input matInput [(ngModel)]="data.owner" placeholder="Owner" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Value</mat-label>
          <input matInput [(ngModel)]="data.value" placeholder="Value" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput [(ngModel)]="data.status" placeholder="Status" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput [(ngModel)]="data.username" placeholder="Username" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Company ID</mat-label>
          <input matInput [value]="data.companyId" disabled />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data" [disabled]="!data.name || !data.type || !data.username">
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
    mat-form-field {
      width: 100%;
    }
    textarea {
      min-height: 80px;
    }
  `]
})
export class CreateAssetDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateAssetDialogComponent>);
  readonly data = inject<CreateAssetPayload>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
