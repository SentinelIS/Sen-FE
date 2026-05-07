import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SetupComponent } from './components/setup/setup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminLoginComponent } from './components/admin/admin-login.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'setup', component: SetupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'create-user',
    component: CreateUserComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
