import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AssetManagementComponent } from '../asset-management/asset-management.component';
import { ProfileAvatarComponent } from '../profile-avatar/profile-avatar.component';
import { RiskManagementComponent } from '../risks/risk-management.component';
import { ControlManagementComponent } from '../controls/control-management.component';
import { RiskReviewKanbanComponent } from '../risks/risk-review-kanban.component';
import { RiskReviewDetailsComponent } from '../risks/risk-review-details.component';
import { RiskReviewDto } from '../../models/risk-review.dto';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    CommonModule,
    NavigationComponent,
    AssetManagementComponent,
    ProfileAvatarComponent,
    RiskManagementComponent,
    ControlManagementComponent,
    RiskReviewKanbanComponent,
    RiskReviewDetailsComponent,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  user = this.authService.getUser();
  readonly userId = Number(this.user?.userId || 0);
  readonly companyId = Number(this.user?.companyId || 1);
  readonly username = this.user?.username || '';

  @ViewChild('rightDrawer') rightDrawer!: MatSidenav;
  @ViewChild(RiskReviewKanbanComponent) kanbanBoard!: RiskReviewKanbanComponent;
  selectedReview: RiskReviewDto | null = null;

  navItems: NavItem[] = [
    { label: 'Asset Management', route: '/asset-management' },
    { label: 'Risk Assessment', route: '/risk-assessment' },
    { label: 'Controls', route: '/controls' },
    { label: 'Policies', route: '/policies' },
    { label: 'Compliance and Audit', route: '/compliance-audit' },
    { label: 'Incident-Management', route: '/incident-management' },
  ];

  bottomNavItems: NavItem[] = [
    { label: 'Admin', route: '/admin-login' },
  ];

  searchQuery: string = '';

  onSearch(): void {
    // Handle search functionality
    console.log('Searching for:', this.searchQuery);
  }

  onReviewSelected(review: RiskReviewDto): void {
    this.selectedReview = review;
    this.rightDrawer.open();
  }

  onReviewUpdated(): void {
    if (this.kanbanBoard) {
      this.kanbanBoard.loadReviews();
    }
    // Update the selectedReview object if it exists to refresh details view
    if (this.selectedReview?.REVIEW_ID) {
      // Find the updated review in the kanban items after they load
      // Alternatively, we can just update the local object properties
      const user = this.authService.getUser();
      if (user) {
        this.selectedReview.REVIEWER_ID = Number(user.userId);
        this.selectedReview.REVIEWER_ABBR = (user.firstname[0] + user.surname).toUpperCase();
      }
    }
  }

  closeRightDrawer(): void {
    this.rightDrawer.close();
    this.selectedReview = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
