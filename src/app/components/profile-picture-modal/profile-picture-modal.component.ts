import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePictureService } from '../../services/profile-picture.service';

export interface ProfilePictureModalData {
  userId: number;
}

@Component({
  selector: 'app-profile-picture-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './profile-picture-modal.component.html',
  styleUrl: './profile-picture-modal.component.scss',
})
export class ProfilePictureModalComponent implements OnInit, OnDestroy {
  private readonly profilePictureService = inject(ProfilePictureService);
  private readonly dialogRef = inject(MatDialogRef<ProfilePictureModalComponent>);

  imageUrl: string | null = null;
  selectedFile: File | null = null;
  selectedPreviewUrl: string | null = null;
  isUploading = false;
  errorMessage = '';
  statusMessage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProfilePictureModalData) {}

  ngOnInit(): void {
    this.loadCurrentImage();
  }

  ngOnDestroy(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
    if (this.selectedPreviewUrl) {
      URL.revokeObjectURL(this.selectedPreviewUrl);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.errorMessage = '';
    this.statusMessage = '';

    if (!file) {
      return;
    }

    const validationError = this.profilePictureService.validateFile(file);
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.selectedFile = file;
    if (this.selectedPreviewUrl) {
      URL.revokeObjectURL(this.selectedPreviewUrl);
    }
    this.selectedPreviewUrl = URL.createObjectURL(file);
  }

  upload(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    this.isUploading = true;
    this.profilePictureService.uploadProfilePicture(this.data.userId, this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.statusMessage = res.message;
        this.dialogRef.close(true);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isUploading = false;
        this.errorMessage = err?.error?.message || 'Upload failed.';
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private loadCurrentImage(): void {
    this.profilePictureService.getProfilePictureBlob(this.data.userId).subscribe({
      next: (blob) => {
        if (!blob) {
          this.imageUrl = null;
          return;
        }
        if (this.imageUrl) {
          URL.revokeObjectURL(this.imageUrl);
        }
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: () => {
        this.imageUrl = null;
      },
    });
  }
}
