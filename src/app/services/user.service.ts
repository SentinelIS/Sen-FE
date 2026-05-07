import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  userId: number;
  firstname: string;
  surname: string;
  role: string;
  username: string;
  companyId: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = '/api/users/preview';
  private readonly http = inject(HttpClient);

  getUserById(userId: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${userId}`);
  }

  searchInternalUsers(companyId: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/internal`, { params: { companyId } });
  }

  searchExternalUsers(companyId: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/external`, { params: { companyId } });
  }
}
