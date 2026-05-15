import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminUserDto, AdminStatsDto } from '../../models/admin.dto';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { CreateUserComponent } from '../create-user/create-user.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    CreateUserComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

  users: AdminUserDto[] = [];
  stats?: AdminStatsDto;
  displayedColumns: string[] = ['userId', 'username', 'firstname', 'surname', 'role', 'actions'];
  isCreateUserCollapsed = true;
  isUsersTableCollapsed = false;

  ngOnInit(): void {
    this.loadData();
  }

  toggleCreateUser(): void {
    this.isCreateUserCollapsed = !this.isCreateUserCollapsed;
  }

  toggleUsersTable(): void {
    this.isUsersTableCollapsed = !this.isUsersTableCollapsed;
  }

  loadData(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('AdminPanel: Fetched users:', res);
        if (Array.isArray(res)) {
          this.users = res;
        } else if (res && Array.isArray(res.users)) {
          this.users = res.users;
        } else if (res && res.data && Array.isArray(res.data)) {
          this.users = res.data;
        } else if (res && res.success && Array.isArray(res.users)) {
          this.users = res.users;
        }
      },
      error: (err) => {
        console.error('AdminPanel: Error loading users:', err);
        this.showError('Failed to load users');
      },
    });

    this.adminService.getStats().subscribe({
      next: (stats) => (this.stats = stats),
      error: (err) => this.showError('Failed to load statistics'),
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (err) => this.showError('Failed to delete user'),
      });
    }
  }

  resetPassword(userId: number): void {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      this.adminService.resetPassword(userId, newPassword).subscribe({
        next: () => {
          this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
        },
        error: (err) => this.showError('Failed to reset password'),
      });
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
}
