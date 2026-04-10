import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePictureService } from '../../services/profile-picture.service';
import { ProfilePictureModalComponent } from '../profile-picture-modal/profile-picture-modal.component';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
})
export class ProfileAvatarComponent implements OnChanges, OnDestroy {
  private readonly profilePictureService = inject(ProfilePictureService);
  private readonly dialog = inject(MatDialog);

  @Input({ required: true }) userId!: number;

  imageUrl: string | null = null;
  hasImage = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']?.currentValue) {
      this.loadProfileImage();
    }
  }

  ngOnDestroy(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }

  openModal(): void {
    if (!this.userId) {
      return;
    }

    const ref = this.dialog.open(ProfilePictureModalComponent, {
      width: '420px',
      data: { userId: this.userId },
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadProfileImage();
      }
    });
  }

  private loadProfileImage(): void {
    this.profilePictureService.getProfilePictureBlob(this.userId).subscribe({
      next: (blob) => {
        if (this.imageUrl) {
          URL.revokeObjectURL(this.imageUrl);
          this.imageUrl = null;
        }
        if (!blob) {
          this.hasImage = false;
          return;
        }
        this.imageUrl = URL.createObjectURL(blob);
        this.hasImage = true;
      },
      error: () => {
        this.hasImage = false;
      },
    });
  }
}
