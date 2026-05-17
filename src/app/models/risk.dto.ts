export interface RiskDto {
  risk_id?: string;
  username: string;
  companyId: number;
  title: string;
  category: 'cybersecurity' | 'compliance' | 'financial' | 'operational';
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high' | 'very high';
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'closed';
  description: string;
  inherent_risk_score: number;
  residual_risk_score: number;
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
}

export interface RiskAnalyticsByCategory {
  category: string;
  count: number;
}
