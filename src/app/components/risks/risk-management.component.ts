import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { RiskService } from '../../services/risk.service';
import { CreateRiskDialogComponent } from './create-risk-dialog.component';
import { RiskDetailsDialogComponent } from './risk-details-dialog.component';
import { RiskDto, RiskAnalyticsByCategory } from '../../models/risk.dto';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    BaseChartDirective,
  ],
  template: `
    <mat-card class="asset-shell" *ngIf="overdueRisks.length > 0">
      <mat-card-header>
        <mat-card-title class="urgent-title">
          <mat-icon color="warn">warning</mat-icon>
          Urgent: Overdue Risk Reviews
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-wrapper">
          <table mat-table [dataSource]="overdueRisks" class="mat-elevation-z1 full-width">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Risk Title</th>
              <td mat-cell *matCellDef="let risk">{{ risk.mongo?.title || risk.title }}</td>
            </ng-container>
            <ng-container matColumnDef="owner">
              <th mat-header-cell *matHeaderCellDef>Owner</th>
              <td mat-cell *matCellDef="let risk">{{ risk.username }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let risk">{{ risk.mongo?.status || risk.status }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['title', 'owner', 'status']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['title', 'owner', 'status']" (click)="openRiskDetails(row)" class="clickable-row"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>

    <mat-card class="asset-shell">
      <mat-card-header (click)="toggleManagement()" style="cursor: pointer;">
        <div style="display: flex; flex-direction: column;">
          <mat-card-title>Risk Assessment</mat-card-title>
          <mat-card-subtitle>Company {{ companyId }}</mat-card-subtitle>
        </div>
        <span class="spacer"></span>
        <button mat-icon-button matTooltip="Add risk" (click)="$event.stopPropagation(); openCreateRiskDialog()">
          <mat-icon>add</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Refresh risks" (click)="$event.stopPropagation(); loadRisks()">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button (click)="$event.stopPropagation(); toggleManagement()">
          <mat-icon>{{ isManagementCollapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content *ngIf="!isManagementCollapsed">
        <div class="table-wrapper">
          <table mat-table [dataSource]="risks" class="mat-elevation-z1 full-width">
            <ng-container matColumnDef="risk_id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let risk">{{ risk.risk_id }}</td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let risk">{{ risk.mongo?.title || risk.title }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let risk">{{ risk.mongo?.category || risk.category }}</td>
            </ng-container>

            <ng-container matColumnDef="impact">
              <th mat-header-cell *matHeaderCellDef>Impact</th>
              <td mat-cell *matCellDef="let risk">
                <mat-chip [color]="getImpactColor(risk.mongo?.impact || risk.impact)" selected>
                  {{ risk.mongo?.impact || risk.impact }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="likelihood">
              <th mat-header-cell *matHeaderCellDef>Likelihood</th>
              <td mat-cell *matCellDef="let risk">{{ risk.mongo?.likelihood || risk.likelihood }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let risk">
                <mat-chip [color]="getStatusColor(risk.mongo?.status || risk.status)" selected>
                  {{ risk.mongo?.status || risk.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let risk">
                <button mat-icon-button matTooltip="View Details" (click)="$event.stopPropagation(); openRiskDetails(risk)" class="action-btn">
                  <mat-icon>touch_app</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete Risk" (click)="$event.stopPropagation(); deleteRisk(risk)" color="warn" class="action-btn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="openRiskDetails(row)" class="clickable-row"></tr>
          </table>
        </div>
        <div *ngIf="risks.length === 0" class="no-data-msg">
          No risks identified yet.
        </div>
      </mat-card-content>
    </mat-card>

    <mat-card class="asset-shell">
      <mat-card-header (click)="toggleAnalytics()" style="cursor: pointer;">
        <mat-card-title>Risk Analytics</mat-card-title>
        <span class="spacer"></span>
        <button mat-icon-button matTooltip="Refresh analytics" (click)="$event.stopPropagation(); loadAnalytics()">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button (click)="$event.stopPropagation(); toggleAnalytics()">
          <mat-icon>{{ isAnalyticsCollapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content *ngIf="!isAnalyticsCollapsed">
        <div class="summary-cards" *ngIf="scoreSummary">
          <mat-card class="score-card">
            <mat-card-subtitle>Avg Inherent Score</mat-card-subtitle>
            <mat-card-title>{{ scoreSummary.avgInherentScore | number:'1.1-1' }}</mat-card-title>
          </mat-card>
          <mat-card class="score-card">
            <mat-card-subtitle>Avg Residual Score</mat-card-subtitle>
            <mat-card-title>{{ scoreSummary.avgResidualScore | number:'1.1-1' }}</mat-card-title>
          </mat-card>
          <mat-card class="score-card reduction">
            <mat-card-subtitle>Risk Reduction</mat-card-subtitle>
            <mat-card-title>{{ scoreSummary.reductionPercentage | number:'1.1-1' }}%</mat-card-title>
          </mat-card>
        </div>

        <div class="charts-grid">
          <div class="chart-card heatmap-card">
            <h4>Risk Heatmap (Impact vs Likelihood)</h4>
            <div class="heatmap-grid">
              <div class="heatmap-row" *ngFor="let impact of levels">
                <div class="heatmap-cell" 
                     *ngFor="let likelihood of levels"
                     [style.background-color]="getHeatmapColor(impact, likelihood)">
                  <span class="cell-count">{{ riskMatrix[impact]?.[likelihood] || 0 }}</span>
                  <span class="cell-label">{{ impact }}/{{ likelihood }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-card">
            <h4>Treatment Strategy</h4>
            <canvas baseChart [data]="treatmentChartData" [type]="'doughnut'"></canvas>
          </div>
          <div class="chart-card">
            <h4>Inherent vs Residual Risk</h4>
            <canvas baseChart [data]="scoreChartData" [type]="'bar'"></canvas>
          </div>
          <div class="chart-card">
            <h4>By Category</h4>
            <canvas baseChart [data]="byCategoryChartData" [type]="'bar'"></canvas>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .asset-shell {
      margin: 16px 0;
      border-radius: 12px;
      mat-card-header {
        display: flex;
        align-items: center;
        width: 100%;
      }
    }
    .urgent-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #b3261e;
    }
    .spacer { flex: 1 1 auto; }
    .table-wrapper {
      overflow-x: auto;
      margin-top: 16px;
      margin-bottom: 16px;
      border: 1px solid #e6e8eb;
      border-radius: 10px;
    }
    .clickable-row {
      cursor: pointer;
      &:hover {
        background-color: #f5f7f9;
      }
    }
    .action-btn {
      // Inherit default material icon button color
    }
    .full-width { width: 100%; }
    .no-data-msg {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }
    .summary-cards {
      display: flex;
      gap: 16px;
      margin-top: 16px;
      .score-card {
        flex: 1;
        padding: 16px;
        text-align: center;
        border: 1px solid #e6e8eb;
        box-shadow: none;
        &.reduction {
          background-color: #e8f0fe;
          mat-card-title { color: #1967d2; }
        }
      }
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 14px;
      margin-top: 16px;
    }
    .chart-card {
      border: 1px solid #e6e8eb;
      border-radius: 12px;
      padding: 12px;
      background: #fff;
    }
    .heatmap-card {
      grid-column: span 1;
    }
    .heatmap-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 8px;
    }
    .heatmap-row {
      display: flex;
      gap: 4px;
      height: 60px;
    }
    .heatmap-cell {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      .cell-count { font-size: 1.2rem; font-weight: bold; }
      .cell-label { font-size: 0.7rem; opacity: 0.9; }
    }
  `]
})
export class RiskManagementComponent implements OnInit {
  @Input() companyId!: number;
  @Input() username!: string;

  private readonly riskService = inject(RiskService);
  private readonly dialog = inject(MatDialog);

  risks: any[] = [];
  overdueRisks: any[] = [];
  riskMatrix: any = {};
  scoreSummary: any = null;
  levels = ['critical', 'high', 'medium', 'low'];

  isManagementCollapsed = false;
  isAnalyticsCollapsed = false;
  readonly displayedColumns = ['risk_id', 'title', 'category', 'impact', 'likelihood', 'status', 'actions'];

  byCategoryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Risks by Category' }],
  };

  treatmentChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Treatment Strategy' }],
  };

  scoreChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Inherent Score', 'Residual Score'],
    datasets: [{ data: [], label: 'Average Risk Scores' }],
  };

  ngOnInit(): void {
    this.loadRisks();
    this.loadAnalytics();
  }

  loadRisks(): void {
    this.riskService.getRisks(this.companyId).subscribe((risks) => {
      this.risks = risks;
    });
    this.riskService.getOverdueReviews(this.companyId).subscribe((risks) => {
      this.overdueRisks = risks;
    });
  }

  loadAnalytics(): void {
    this.riskService.getAnalyticsByCategory(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      this.byCategoryChartData = {
        labels: data.map((row: any) => row.category || row.key),
        datasets: [{ data: data.map((row: any) => row.count), label: 'Risks by Category' }],
      };
    });

    this.riskService.getAnalyticsByTreatment(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      this.treatmentChartData = {
        labels: data.map((row: any) => row.key),
        datasets: [{ data: data.map((row: any) => row.count), label: 'Treatment Strategy' }],
      };
    });

    this.riskService.getRiskScoreSummary(this.companyId).subscribe((res: any) => {
      const data = res.data || res;
      this.scoreSummary = data;
      this.scoreChartData = {
        labels: ['Inherent', 'Residual'],
        datasets: [{ 
          data: [data.avgInherentScore, data.avgResidualScore], 
          label: 'Risk Score Reduction',
          backgroundColor: ['#f44336', '#4caf50']
        }],
      };
    });

    this.riskService.getRiskMatrix(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      const grid: any = {};
      data.forEach((item: any) => {
        const [impact, likelihood] = item.key.split('/');
        if (!grid[impact]) grid[impact] = {};
        grid[impact][likelihood] = item.count;
      });
      this.riskMatrix = grid;
    });
  }

  getHeatmapColor(impact: string, likelihood: string): string {
    const high = ['critical', 'high'];
    const medium = ['medium'];
    
    if (high.includes(impact) && high.includes(likelihood)) return '#d32f2f'; // Dark Red
    if (high.includes(impact) || high.includes(likelihood)) {
      if (medium.includes(impact) || medium.includes(likelihood)) return '#f57c00'; // Orange
      return '#ff9800'; // Amber
    }
    if (medium.includes(impact) && medium.includes(likelihood)) return '#fbc02d'; // Yellow
    return '#4caf50'; // Green
  }

  toggleManagement(): void { this.isManagementCollapsed = !this.isManagementCollapsed; }
  toggleAnalytics(): void { this.isAnalyticsCollapsed = !this.isAnalyticsCollapsed; }

  getImpactColor(impact: string): string {
    switch (impact) {
      case 'critical': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      default: return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'mitigated':
      case 'closed': return 'primary';
      case 'critical': return 'warn';
      default: return '';
    }
  }

  openCreateRiskDialog(): void {
    const dialogRef = this.dialog.open(CreateRiskDialogComponent, {
      width: '600px',
      data: {
        username: this.username,
        companyId: this.companyId,
        title: '',
        category: 'cybersecurity',
        impact: 'medium',
        likelihood: 'medium',
        status: 'identified',
        description: '',
        inherent_risk_score: 1,
        residual_risk_score: 1,
        treatment: 'mitigate',
      },
    });

    dialogRef.afterClosed().subscribe((result: RiskDto) => {
      if (result) {
        this.riskService.createRisk(result).subscribe(() => {
          this.loadRisks();
          this.loadAnalytics();
        });
      }
    });
  }

  openRiskDetails(risk: any): void {
    this.dialog.open(RiskDetailsDialogComponent, {
      width: '700px',
      data: risk
    });
  }

  deleteRisk(risk: any): void {
    if (confirm(`Are you sure you want to delete the risk "${risk.mongo?.title || risk.title}"?`)) {
      const riskId = risk.risk_id;
      this.riskService.deleteRisk(riskId).subscribe(() => {
        this.loadRisks();
        this.loadAnalytics();
      });
    }
  }
}
