import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserService, UserDto } from '../../services/user.service';
import { Asset } from '../../services/asset.service';

@Component({
  selector: 'app-share-asset-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Share Asset: {{ data.asset.name }}</h2>
    <mat-dialog-content>
      <p>Select a user to share this asset with:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Receiver</mat-label>
        <mat-select [(ngModel)]="selectedUserId" required>
          <mat-option *ngFor="let user of users" [value]="user.userId">
            {{ user.firstname }} {{ user.surname }} ({{ user.username }})
          </mat-option>
        </mat-select>
      </mat-form-field>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="selectedUserId" [disabled]="!selectedUserId">
        Share
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .error {
      color: #b3261e;
      font-size: 0.875rem;
    }
  `]
})
export class ShareAssetDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ShareAssetDialogComponent>);
  readonly data = inject<{ asset: Asset; companyId: string }>(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);

  users: UserDto[] = [];
  selectedUserId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.searchInternalUsers(this.data.companyId).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.errorMessage = 'Failed to load users.';
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
