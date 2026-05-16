import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUserDto, AdminStatsDto } from '../models/admin.dto';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = '/api/admin';

  constructor(private readonly http: HttpClient) {}

  getAllUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.apiUrl}/users`);
  }

  getStats(): Observable<AdminStatsDto> {
    return this.http.get<AdminStatsDto>(`${this.apiUrl}/stats`);
  }

  isAdmin(userId: number): Observable<{ isAdmin: boolean }> {
    return this.http.get<{ isAdmin: boolean }>(`/api/users/${userId}/is-admin`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  resetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reset-password`, { newPassword });
  }

  getChatReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat/reports`);
  }

  generatePassword(): Observable<{ password: string }> {
    return this.http.get<{ password: string }>(`${this.apiUrl}/users/passwords/generate`);
  }

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }

  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies`);
  }

  getGrowthData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/growth`);
  }

  getRoleDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/roles`);
  }

  getAdminRatio(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/admin-ratio`);
  }

  getCompanyDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/company-distribution`);
  }
}
