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
import { ReportDetailsDialogComponent } from './report-details-dialog.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

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
    BaseChartDirective,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  users: AdminUserDto[] = [];
  admins: any[] = [];
  companies: any[] = [];
  stats?: AdminStatsDto;
  chatReports: any[] = [];
  userSearchQuery = '';
  displayedColumns: string[] = ['userId', 'username', 'firstname', 'surname', 'role', 'actions'];
  reportColumns: string[] = ['timestamp', 'reporter', 'sender', 'reason', 'status', 'actions'];
  companyColumns: string[] = ['compId', 'name', 'description', 'ownerId', 'created'];
  isCreateUserCollapsed = true;
  isUsersTableCollapsed = false;
  isAdminsCollapsed = true;
  isCompaniesCollapsed = true;
  isChatReportsCollapsed = false;
  isAnalyticsCollapsed = true;

  // Analytics Data
  public growthChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public roleChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public companyChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public adminRatio: any = null;

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } }
  };

  get filteredUsers(): AdminUserDto[] {
    if (!this.userSearchQuery.trim()) {
      return this.users;
    }
    const query = this.userSearchQuery.toLowerCase();
    return this.users.filter((user) => {
      const username = (user.USER_ABBR || user.username || '').toLowerCase();
      const firstname = (user.USER_FIRST_NAME || user.firstname || '').toLowerCase();
      const surname = (user.USER_SURNAME || user.surname || '').toLowerCase();
      return username.includes(query) || firstname.includes(query) || surname.includes(query);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  toggleCreateUser(): void {
    this.isCreateUserCollapsed = !this.isCreateUserCollapsed;
  }

  toggleUsersTable(): void {
    this.isUsersTableCollapsed = !this.isUsersTableCollapsed;
  }

  toggleAdmins(): void {
    this.isAdminsCollapsed = !this.isAdminsCollapsed;
  }

  toggleCompanies(): void {
    this.isCompaniesCollapsed = !this.isCompaniesCollapsed;
  }

  toggleChatReports(): void {
    this.isChatReportsCollapsed = !this.isChatReportsCollapsed;
  }

  toggleAnalytics(): void {
    this.isAnalyticsCollapsed = !this.isAnalyticsCollapsed;
    if (!this.isAnalyticsCollapsed) {
      this.loadAnalytics();
    }
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

    this.adminService.getAdmins().subscribe({
      next: (res) => {
        this.admins = res;
      },
      error: (err) => {
        console.error('AdminPanel: Error loading admins:', err);
      }
    });

    this.adminService.getCompanies().subscribe({
      next: (res) => {
        this.companies = res;
      },
      error: (err) => {
        console.error('AdminPanel: Error loading companies:', err);
      }
    });

    this.adminService.getStats().subscribe({
      next: (stats) => (this.stats = stats),
      error: (err) => this.showError('Failed to load statistics'),
    });

    this.adminService.getChatReports().subscribe({
      next: (reports) => (this.chatReports = reports),
      error: (err) => console.error('AdminPanel: Error loading reports:', err),
    });

    if (!this.isAnalyticsCollapsed) {
      this.loadAnalytics();
    }
  }

  loadAnalytics(): void {
    this.adminService.getGrowthData().subscribe({
      next: (data) => {
        this.growthChartData = {
          labels: data.map(d => d.month),
          datasets: [{
            data: data.map(d => d.count),
            label: 'New Users',
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4
          }]
        };
      }
    });

    this.adminService.getRoleDistribution().subscribe({
      next: (data) => {
        this.roleChartData = {
          labels: data.map(d => d.role),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          }]
        };
      }
    });

    this.adminService.getCompanyDistribution().subscribe({
      next: (data) => {
        this.companyChartData = {
          labels: data.map(d => d.companyName),
          datasets: [{
            data: data.map(d => d.userCount),
            backgroundColor: '#10b981'
          }]
        };
      }
    });

    this.adminService.getAdminRatio().subscribe({
      next: (data) => this.adminRatio = data
    });
  }

  viewReportDetails(report: any): void {
    this.dialog.open(ReportDetailsDialogComponent, {
      width: '600px',
      data: report,
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
