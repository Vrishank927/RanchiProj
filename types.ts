
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RiskType {
  GENERAL_SAFETY = 'GENERAL_SAFETY',
  PHISHING = 'PHISHING',
  GROOMING = 'GROOMING'
}

export enum RecommendedAction {
  ALLOW = 'ALLOW',
  MONITOR = 'MONITOR',
  BLOCK = 'BLOCK'
}

export interface ScanResult {
  riskType: RiskType; // New: Categorization of the specific threat
  riskLevel: RiskLevel;
  confidenceScore: number;
  category: string;
  reason: string;
  recommendedAction: RecommendedAction;
  parentAlert: string;
  educationalGuidance: string;
  safetyConsequences: string;
  signalsDetected?: string[]; // New: Specific indicators (e.g., typosquatting, secrecy_request)
  timestamp?: string;
}

export interface HistoryItem extends ScanResult {
  id: string;
  contentSnippet: string;
  timestamp: string;
}
