import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import {
  AnalyticsByMonthItem,
  AnalyticsItem,
  AnalyticsSummary,
  Asset,
  AssetService,
  CompanyAssetListItem,
  CreateAssetPayload,
  UpdateAssetPayload,
} from '../../services/asset.service';
import { AuthService } from '../../auth/auth.service';
import { ChartConfiguration } from 'chart.js';
import { CreateAssetDialogComponent } from './create-asset-dialog.component';
import { EditAssetDialogComponent } from './edit-asset-dialog.component';
import { ShareAssetDialogComponent } from './share-asset-dialog.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-asset-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    BaseChartDirective,
  ],
  templateUrl: './asset-management.component.html',
  styleUrl: './asset-management.component.scss',
})
export class AssetManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly assetService = inject(AssetService);
  private readonly chatService = inject(ChatService);
  private readonly dialog = inject(MatDialog);

  readonly user = this.authService.getUser();
  readonly companyId = Number(this.user?.companyId || 0);
  readonly displayedColumns = ['asset_id', 'name', 'type', 'status', 'value', 'classification', 'actions'];

  assets: Asset[] = [];
  selectedAssetId: number | null = null;
  statusMessage = '';
  errorMessage = '';
  isAnalyticsCollapsed = false;
  isManagementCollapsed = false;

  createAssetModel: CreateAssetPayload = {
    name: '',
    type: '',
    username: this.user?.username || '',
    companyId: this.companyId,
    description: '',
    classification: '',
    location: '',
    owner: '',
    value: 'high',
    status: 'active',
  };

  updateAssetModel: UpdateAssetPayload = {
    name: '',
    type: '',
    description: '',
    classification: '',
    location: '',
    owner: '',
    value: '',
    status: '',
  };

  analyticsByType: AnalyticsItem[] = [];
  analyticsByStatus: AnalyticsItem[] = [];
  analyticsByValue: AnalyticsItem[] = [];
  analyticsByClassification: AnalyticsItem[] = [];
  analyticsByMonth: AnalyticsByMonthItem[] = [];
  analyticsSummary: AnalyticsSummary | null = null;

  byTypeChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Assets by type' }] };
  byStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Assets by status' }],
  };
  byValueChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [{ data: [], label: 'Assets by value' }] };
  byClassificationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Assets by classification' }],
  };
  byMonthChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: 'Assets by month' }] };

  ngOnInit(): void {
    this.loadAssets();
    this.loadAnalytics();
  }

  loadAssets(): void {
    this.clearMessages();
    if (!this.companyId) {
      this.errorMessage = 'Missing company ID.';
      return;
    }

    this.assetService.getAssets(this.companyId).subscribe({
      next: (res) => {
        this.assets = (res || []).map((item) => this.toAsset(item));
      },
      error: () => {
        this.errorMessage =
          'Assets could not be loaded with GET /api/assets?companyId=. Please confirm backend endpoint shape.';
      },
    });
  }

  downloadAssets(): void {
    this.clearMessages();
    if (!this.companyId) {
      this.errorMessage = 'Missing company ID.';
      return;
    }

    this.statusMessage = 'Preparing download...';
    this.assetService.downloadAssets(this.companyId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets_company_${this.companyId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.statusMessage = 'Download started.';
      },
      error: (err) => {
        this.errorMessage = 'Download failed.';
        this.handleError(err);
      },
    });
  }

  openCreateAssetDialog(): void {
    const dialogRef = this.dialog.open(CreateAssetDialogComponent, {
      width: '600px',
      data: { ...this.createAssetModel },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createAsset(result);
      }
    });
  }

  createAsset(payload: CreateAssetPayload): void {
    this.clearMessages();
    if (!payload.name || !payload.type || !payload.username || !payload.companyId) {
      this.errorMessage = 'Name, type, username and companyId are required.';
      return;
    }

    this.assetService.createAsset(payload).subscribe({
      next: (res) => {
        this.statusMessage = `${res.message} (ID: ${res.assetId})`;
        this.loadAssets();
        this.loadAnalytics();
      },
      error: (err) => this.handleError(err),
    });
  }

  startEdit(asset: Asset): void {
    const dialogRef = this.dialog.open(EditAssetDialogComponent, {
      width: '600px',
      data: {
        id: asset.asset_id,
        payload: {
          name: asset.name || '',
          type: asset.type || '',
          description: asset.description || '',
          classification: asset.classification || '',
          location: asset.location || '',
          owner: asset.owner || '',
          value: asset.value || '',
          status: asset.status || '',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateAsset(asset.asset_id, result);
      }
    });
  }

  updateAsset(id: number, payload: UpdateAssetPayload): void {
    this.clearMessages();
    if (!id) {
      this.errorMessage = 'Please select an asset to edit.';
      return;
    }

    this.assetService.updateAsset(id, payload).subscribe({
      next: (res) => {
        this.statusMessage = res.message;
        this.loadAssets();
        this.loadAnalytics();
      },
      error: (err) => this.handleError(err),
    });
  }

  shareAsset(asset: Asset): void {
    this.clearMessages();
    const senderId = this.user?.userId;
    const companyId = this.user?.companyId;

    if (!senderId || !companyId) {
      this.errorMessage = 'User information missing.';
      return;
    }

    const dialogRef = this.dialog.open(ShareAssetDialogComponent, {
      width: '400px',
      data: { asset, companyId },
    });

    dialogRef.afterClosed().subscribe((receiverId: number) => {
      if (receiverId) {
        this.chatService.sendAsset(senderId, receiverId, asset.asset_id).subscribe({
          next: (res) => {
            this.statusMessage = res.message || 'Asset shared successfully.';
          },
          error: (err) => this.handleError(err),
        });
      }
    });
  }

  deleteAsset(assetId: number): void {
    this.clearMessages();
    this.assetService.deleteAsset(Number(assetId)).subscribe({
      next: (res) => {
        this.statusMessage = res.message;
        this.assets = this.assets.filter((asset) => asset.asset_id !== assetId);
        if (this.selectedAssetId === assetId) {
          this.selectedAssetId = null;
        }
        this.loadAnalytics();
      },
      error: (err) => this.handleError(err),
    });
  }

  toggleAnalytics(): void {
    this.isAnalyticsCollapsed = !this.isAnalyticsCollapsed;
  }

  toggleManagement(): void {
    this.isManagementCollapsed = !this.isManagementCollapsed;
  }

  loadAnalytics(): void {
    if (!this.companyId) {
      return;
    }

    this.assetService.getAnalyticsByType(this.companyId).subscribe({
      next: (res) => {
        this.analyticsByType = res.data;
        this.byTypeChartData = {
          labels: res.data.map((row) => row.key),
          datasets: [{ data: res.data.map((row) => row.count), label: 'Assets by type' }],
        };
      },
    });

    this.assetService.getAnalyticsByStatus(this.companyId).subscribe({
      next: (res) => {
        this.analyticsByStatus = res.data;
        this.byStatusChartData = {
          labels: res.data.map((row) => row.key),
          datasets: [{ data: res.data.map((row) => row.count), label: 'Assets by status' }],
        };
      },
    });

    this.assetService.getAnalyticsByValue(this.companyId).subscribe({
      next: (res) => {
        this.analyticsByValue = res.data;
        this.byValueChartData = {
          labels: res.data.map((row) => row.key),
          datasets: [{ data: res.data.map((row) => row.count), label: 'Assets by value' }],
        };
      },
    });

    this.assetService.getAnalyticsByClassification(this.companyId).subscribe({
      next: (res) => {
        this.analyticsByClassification = res.data;
        this.byClassificationChartData = {
          labels: res.data.map((row) => row.key),
          datasets: [{ data: res.data.map((row) => row.count), label: 'Assets by classification' }],
        };
      },
    });

    this.assetService.getAnalyticsByMonth(this.companyId).subscribe({
      next: (res) => {
        this.analyticsByMonth = res.data;
        this.byMonthChartData = {
          labels: res.data.map((row) => row.label),
          datasets: [{ data: res.data.map((row) => row.count), label: 'Assets by month' }],
        };
      },
    });

    this.assetService.getAnalyticsSummary(this.companyId).subscribe({
      next: (res) => {
        this.analyticsSummary = res.data;
      },
    });
  }

  private clearMessages(): void {
    this.statusMessage = '';
    this.errorMessage = '';
  }

  private toAsset(item: CompanyAssetListItem): Asset {
    return {
      asset_id: item.asset_id,
      name: item.mongo?.name || `Asset ${item.asset_id}`,
      type: item.mongo?.type || 'unknown',
      description: item.mongo?.description,
      classification: item.mongo?.classification,
      location: item.mongo?.location,
      owner: item.mongo?.owner,
      value: item.mongo?.value,
      status: item.mongo?.status,
      risks: item.mongo?.risks || [],
      controls: item.mongo?.controls || [],
      created_at: item.mongo?.created_at,
      updated_at: item.mongo?.updated_at,
    };
  }

  private handleError(err: { status?: number; error?: { message?: string } }): void {
    if (err?.status === 404) {
      this.errorMessage = 'Asset not found.';
      return;
    }
    if (err?.status === 400) {
      this.errorMessage = err?.error?.message || 'Validation failed.';
      return;
    }
    this.errorMessage = err?.error?.message || 'Request failed. Please retry.';
  }
}
