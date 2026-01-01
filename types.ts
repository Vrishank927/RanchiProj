
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RecommendedAction {
  ALLOW = 'ALLOW',
  MONITOR = 'MONITOR',
  BLOCK = 'BLOCK'
}

export interface ScanResult {
  riskLevel: RiskLevel;
  confidenceScore: number;
  category: string;
  reason: string;
  recommendedAction: RecommendedAction;
  parentAlert: string;
  timestamp?: string;
}

export interface HistoryItem extends ScanResult {
  id: string;
  contentSnippet: string;
  timestamp: string;
}
