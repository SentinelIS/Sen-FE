import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskReviewDto, CreateRiskReviewPayload, UpdateRiskReviewStatusPayload } from '../models/risk-review.dto';

@Injectable({
  providedIn: 'root',
})
export class RiskReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/risk-reviews';

  getRiskReviews(companyId: number): Observable<RiskReviewDto[]> {
    return this.http.get<RiskReviewDto[]>(`${this.apiUrl}?companyId=${companyId}`);
  }

  createRiskReview(payload: CreateRiskReviewPayload): Observable<RiskReviewDto> {
    return this.http.post<RiskReviewDto>(this.apiUrl, payload);
  }

  updateReviewStatus(reviewId: number, payload: UpdateRiskReviewStatusPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${reviewId}/status`, payload);
  }
}
