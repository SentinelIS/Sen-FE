import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UpdateAssetPayload } from '../../services/asset.service';

@Component({
  selector: 'app-edit-asset-dialog',
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
    <h2 mat-dialog-title>Edit Asset #{{ data.id }}</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="data.payload.name" placeholder="Asset Name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <input matInput [(ngModel)]="data.payload.type" placeholder="Asset Type" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="data.payload.description" placeholder="Description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Classification</mat-label>
          <input matInput [(ngModel)]="data.payload.classification" placeholder="Classification" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Location</mat-label>
          <input matInput [(ngModel)]="data.payload.location" placeholder="Location" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Owner</mat-label>
          <input matInput [(ngModel)]="data.payload.owner" placeholder="Owner" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Value</mat-label>
          <input matInput [(ngModel)]="data.payload.value" placeholder="Value" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput [(ngModel)]="data.payload.status" placeholder="Status" />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="accent" [mat-dialog-close]="data.payload">
        Update
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
export class EditAssetDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditAssetDialogComponent>);
  readonly data = inject<{ id: number; payload: UpdateAssetPayload }>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
