export interface RiskReviewCommentDto {
  comment_id?: number;
  review_id: number;
  user_abbr: string;
  content: string;
  created_at: string;
}

export interface RiskReviewDto {
  REVIEW_ID?: number;
  RISK_ID: number;
  REVIEW_STATUS: 'READY_FOR_REVIEW' | 'IN_REVIEW' | 'NEEDS_CHANGES' | 'DONE';
  REVIEW_NOTES?: string;
  CREATED_AT?: string;
  REVIEWER_ID?: number | null;
  REVIEWER_ABBR?: string | null;
  riskTitle?: string; // Optional field for UI convenience
  comments?: RiskReviewCommentDto[];
}

export interface CreateRiskReviewPayload {
  riskId: number;
  companyId: number;
  notes?: string;
}

export interface UpdateRiskReviewStatusPayload {
  status: 'READY_FOR_REVIEW' | 'IN_REVIEW' | 'NEEDS_CHANGES' | 'DONE';
  reviewerId?: number;
  notes?: string;
}
