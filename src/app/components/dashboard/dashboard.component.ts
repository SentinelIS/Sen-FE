import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { Router } from '@angular/router';

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
    CreateUserComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  user = this.authService.getUser();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Asset-Management', route: '/asset-management' },
    { label: 'Risk Assessment', route: '/risk-assessment' },
    { label: 'Policies', route: '/policies' },
    { label: 'Compliance and Audit', route: '/compliance-audit' },
    { label: 'Incident-Management', route: '/incident-management' },
  ];

  searchQuery: string = '';

  onSearch(): void {
    // Handle search functionality
    console.log('Searching for:', this.searchQuery);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
