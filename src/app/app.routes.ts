import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SetupComponent } from './components/setup/setup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { CreateUserComponent } from './components/create-user/create-user.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'setup', component: SetupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'create-user',
    component: CreateUserComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
