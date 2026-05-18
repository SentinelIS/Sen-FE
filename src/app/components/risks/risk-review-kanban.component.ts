import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskReviewService } from '../../services/risk-review.service';
import { RiskReviewDto } from '../../models/risk-review.dto';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-risk-review-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <div class="kanban-board">
      <div class="kanban-column" *ngFor="let column of columns" [ngClass]="column.id.toLowerCase().replace(/_/g, '-')">
        <h3 class="column-title">
          {{ column.title }}
          <span class="count">{{ column.items.length }}</span>
        </h3>

        <div
          cdkDropList
          [cdkDropListData]="column.items"
          [id]="column.id"
          [cdkDropListConnectedTo]="connectedTo"
          class="item-list"
          (cdkDropListDropped)="drop($event)"
        >
          <mat-card *ngFor="let item of column.items" cdkDrag class="kanban-card">
            <mat-card-header>
              <mat-card-title>Risk #{{ item.RISK_ID }}</mat-card-title>
              <mat-card-subtitle *ngIf="item.REVIEWER_ABBR">
                Reviewer: {{ item.REVIEWER_ABBR }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="notes" *ngIf="item.REVIEW_NOTES">{{ item.REVIEW_NOTES }}</p>
            </mat-card-content>
            <mat-card-footer>
              <span class="date">{{ item.CREATED_AT | date:'shortDate' }}</span>
            </mat-card-footer>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 16px 0;
      min-height: 400px;
    }
    .kanban-column {
      flex: 1;
      min-width: 250px;
      background: #f1f3f4;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      
      &.ready-for-review { background-color: #e3f2fd; } // Light Blue
      &.in-review { background-color: #fff9c4; }      // Yellow
      &.needs-changes { background-color: #ffcdd2; }   // Light Red
      &.done { background-color: #c8e6c9; }            // Light Green
    }
    .column-title {
      padding: 12px 16px;
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #5f6368;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .count {
        background: #e8eaed;
        color: #5f6368;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
      }
    }
    .item-list {
      flex: 1;
      padding: 8px;
      min-height: 100px;
    }
    .kanban-card {
      margin-bottom: 8px;
      cursor: grab;
      border: 1px solid #e6e8eb;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
      &:active { cursor: grabbing; }
    }
    .notes {
      font-size: 0.85rem;
      color: #3c4043;
      margin: 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .date {
      font-size: 0.75rem;
      color: #70757a;
      padding: 0 16px 8px;
    }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .item-list.cdk-drop-list-dragging .kanban-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class RiskReviewKanbanComponent implements OnInit {
  @Input() companyId!: number;

  private readonly reviewService = inject(RiskReviewService);
  private readonly authService = inject(AuthService);

  columns: any[] = [
    { id: 'READY_FOR_REVIEW', title: 'Ready for Review', items: [] },
    { id: 'IN_REVIEW', title: 'In Review', items: [] },
    { id: 'NEEDS_CHANGES', title: 'Needs Changes', items: [] },
    { id: 'DONE', title: 'Done', items: [] },
  ];

  connectedTo = ['READY_FOR_REVIEW', 'IN_REVIEW', 'NEEDS_CHANGES', 'DONE'];

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getRiskReviews(this.companyId).subscribe((reviews) => {
      this.columns.forEach(col => col.items = []);
      reviews.forEach(review => {
        const column = this.columns.find(col => col.id === review.REVIEW_STATUS);
        if (column) {
          column.items.push(review);
        }
      });
    });
  }

  drop(event: CdkDragDrop<RiskReviewDto[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as any;
      const user = this.authService.getUser();

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update backend
      this.reviewService.updateReviewStatus(item.REVIEW_ID!, {
        status: newStatus,
        reviewerId: newStatus === 'IN_REVIEW' ? Number(user?.userId) : undefined
      }).subscribe(() => {
        this.loadReviews(); // Refresh to get updated reviewer info etc.
      });
    }
  }
}
