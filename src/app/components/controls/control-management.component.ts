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
import { ControlService } from '../../services/control.service';
import { CreateControlDialogComponent } from './create-control-dialog.component';
import { ControlDto } from '../../models/control.dto';

@Component({
  selector: 'app-control-management',
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
    <mat-card class="asset-shell">
      <mat-card-header (click)="toggleManagement()" style="cursor: pointer;">
        <div style="display: flex; flex-direction: column;">
          <mat-card-title>Control Management</mat-card-title>
          <mat-card-subtitle>Company {{ companyId }}</mat-card-subtitle>
        </div>
        <span class="spacer"></span>
        <button mat-icon-button matTooltip="Add control" (click)="$event.stopPropagation(); openCreateControlDialog()">
          <mat-icon>add</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Refresh controls" (click)="$event.stopPropagation(); loadControls()">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button (click)="$event.stopPropagation(); toggleManagement()">
          <mat-icon>{{ isManagementCollapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content *ngIf="!isManagementCollapsed">
        <div class="table-wrapper">
          <table mat-table [dataSource]="controls" class="mat-elevation-z1 full-width">
            <ng-container matColumnDef="control_id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let control">{{ control.control_id }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let control">{{ control.mongo?.name || control.name }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let control">{{ control.mongo?.category || control.category }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let control">
                <mat-chip [color]="getStatusColor(control.mongo?.status || control.status)" selected>
                  {{ control.mongo?.status || control.status }}
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div *ngIf="controls.length === 0" class="no-data-msg">
          No controls implemented yet.
        </div>
      </mat-card-content>
    </mat-card>

    <mat-card class="asset-shell">
      <mat-card-header (click)="toggleAnalytics()" style="cursor: pointer;">
        <mat-card-title>Control Analytics</mat-card-title>
        <span class="spacer"></span>
        <button mat-icon-button matTooltip="Refresh analytics" (click)="$event.stopPropagation(); loadAnalytics()">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button (click)="$event.stopPropagation(); toggleAnalytics()">
          <mat-icon>{{ isAnalyticsCollapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content *ngIf="!isAnalyticsCollapsed">
        <div class="charts-grid">
          <div class="chart-card">
            <h4>Effectiveness</h4>
            <canvas baseChart [data]="effectivenessChartData" [type]="'doughnut'"></canvas>
          </div>
          <div class="chart-card">
            <h4>Automation Degree</h4>
            <canvas baseChart [data]="automationChartData" [type]="'bar'" [options]="horizontalBarOptions"></canvas>
          </div>
          <div class="chart-card">
            <h4>Framework Compliance</h4>
            <canvas baseChart [data]="frameworkChartData" [type]="'radar'"></canvas>
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
    .spacer { flex: 1 1 auto; }
    .table-wrapper {
      overflow-x: auto;
      margin-top: 16px;
      margin-bottom: 16px;
      border: 1px solid #e6e8eb;
      border-radius: 10px;
    }
    .full-width { width: 100%; }
    .no-data-msg {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 14px;
      margin-top: 16px;
    }
    .chart-card {
      border: 1px solid #e6e8eb;
      border-radius: 12px;
      padding: 12px;
      background: #fff;
    }
  `]
})
export class ControlManagementComponent implements OnInit {
  @Input() companyId!: number;
  @Input() username!: string;

  private readonly controlService = inject(ControlService);
  private readonly dialog = inject(MatDialog);

  controls: any[] = [];
  isManagementCollapsed = false;
  isAnalyticsCollapsed = false;
  readonly displayedColumns = ['control_id', 'name', 'category', 'status'];

  effectivenessChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Effectiveness', backgroundColor: ['#4caf50', '#f44336', '#ff9800'] }],
  };

  automationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Automation Degree', backgroundColor: '#1a73e8' }],
  };

  frameworkChartData: ChartConfiguration<'radar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Framework Compliance' }],
  };

  horizontalBarOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
  };

  ngOnInit(): void {
    this.loadControls();
    this.loadAnalytics();
  }

  loadControls(): void {
    this.controlService.getControls(this.companyId).subscribe((controls) => {
      this.controls = controls;
    });
  }

  loadAnalytics(): void {
    this.controlService.getAnalyticsByEffectiveness(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      this.effectivenessChartData = {
        labels: data.map((row: any) => row.key),
        datasets: [{ 
          data: data.map((row: any) => row.count), 
          label: 'Effectiveness',
          backgroundColor: data.map((row: any) => this.getEffectivenessColor(row.key))
        }],
      };
    });

    this.controlService.getAnalyticsByAutomation(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      this.automationChartData = {
        labels: data.map((row: any) => row.key),
        datasets: [{ data: data.map((row: any) => row.count), label: 'Automation Degree', backgroundColor: '#1a73e8' }],
      };
    });

    this.controlService.getAnalyticsByFramework(this.companyId).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : res.data || [];
      this.frameworkChartData = {
        labels: data.map((row: any) => row.key),
        datasets: [{ 
          data: data.map((row: any) => row.count), 
          label: 'Framework Compliance',
          fill: true,
          backgroundColor: 'rgba(26, 115, 232, 0.2)',
          borderColor: '#1a73e8',
          pointBackgroundColor: '#1a73e8',
        }],
      };
    });
  }

  getEffectivenessColor(key: string): string {
    switch (key.toLowerCase()) {
      case 'effective': return '#4caf50';
      case 'ineffective': return '#f44336';
      case 'testing': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  toggleManagement(): void { this.isManagementCollapsed = !this.isManagementCollapsed; }
  toggleAnalytics(): void { this.isAnalyticsCollapsed = !this.isAnalyticsCollapsed; }

  getStatusColor(status: string): string {
    switch (status) {
      case 'effective':
      case 'implemented': return 'primary';
      case 'ineffective': return 'warn';
      default: return '';
    }
  }

  openCreateControlDialog(): void {
    const dialogRef = this.dialog.open(CreateControlDialogComponent, {
      width: '600px',
      data: {
        username: this.username,
        companyId: this.companyId,
        name: '',
        category: 'technical',
        status: 'planned',
        description: '',
      },
    });

    dialogRef.afterClosed().subscribe((result: ControlDto) => {
      if (result) {
        this.controlService.createControl(result).subscribe(() => {
          this.loadControls();
          this.loadAnalytics();
        });
      }
    });
  }
}
