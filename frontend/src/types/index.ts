export interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  visibility: string;
  analysis?: Analysis;
  securityScans?: SecurityScan[];
  latestScan?: SecurityScan;
  latestGovernance?: GovernanceDecision;
  createdAt: string;
}

export interface Analysis {
  id: string;
  repositoryId: string;
  language: string;
  framework: string;
  packageManager: string;
  hasDocker: boolean;
  hasCI: boolean;
}

export interface SecurityScan {
  id: string;
  tool: string;
  status: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  createdAt: string;
}

export interface GovernanceDecision {
  id: string;
  riskLevel: string;
  autoMerge: boolean;
  blocked: boolean;
  reason: string;
  createdAt: string;
}

export interface Job {
  id: string;
  state: string;
  progress: number;
  timestamp: string;
}
