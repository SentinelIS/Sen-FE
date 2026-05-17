import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskDto, RiskAnalyticsByCategory } from '../models/risk.dto';

@Injectable({
  providedIn: 'root',
})
export class RiskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/risks';

  createRisk(risk: RiskDto): Observable<RiskDto> {
    return this.http.post<RiskDto>(this.apiUrl, risk);
  }

  getRisks(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?compId=${companyId}`);
  }

  getRiskById(riskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${riskId}`);
  }

  getAnalyticsByCategory(companyId: number): Observable<RiskAnalyticsByCategory[]> {
    return this.http.get<RiskAnalyticsByCategory[]>(`${this.apiUrl}/analytics/by-category?companyId=${companyId}`);
  }

  getRiskMatrix(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/matrix?companyId=${companyId}`);
  }

  getAnalyticsByTreatment(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/by-treatment?companyId=${companyId}`);
  }

  getRiskScoreSummary(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/score-summary?companyId=${companyId}`);
  }

  getOverdueReviews(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/overdue?companyId=${companyId}`);
  }

  deleteRisk(riskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${riskId}`);
  }
}
