import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ProfilePictureUploadResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfilePictureService {
  private readonly baseUrl = '/api/profile-picture';
  private readonly maxFileSize = 5 * 1024 * 1024;
  private readonly allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];

  constructor(private readonly http: HttpClient) {}

  getProfilePictureBlob(userId: number): Observable<Blob | null> {
    return this.http.get(`${this.baseUrl}/${Number(userId)}`, { responseType: 'blob' }).pipe(
      catchError((err: { status?: number }) => {
        if (err?.status === 404) {
          return of(null);
        }
        throw err;
      }),
    );
  }

  uploadProfilePicture(userId: number, file: File): Observable<ProfilePictureUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProfilePictureUploadResponse>(`${this.baseUrl}/${Number(userId)}`, formData);
  }

  validateFile(file: File): string | null {
    if (!this.allowedMimeTypes.includes(file.type)) {
      return 'Unsupported file type. Use png, jpg, jpeg, gif, or webp.';
    }
    if (file.size > this.maxFileSize) {
      return 'File is too large. Maximum allowed size is 5MB.';
    }
    return null;
  }
}
