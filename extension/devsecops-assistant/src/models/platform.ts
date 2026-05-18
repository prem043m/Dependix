export type AnalysisRecord = {
    id: string;
    repositoryId: string;
    language: string | null;
    framework: string | null;
    packageManager: string | null;
    hasDocker: boolean;
    hasCI: boolean;
    createdAt: string;
};

export type SecurityScanRecord = {
    id: string;
    repositoryId: string;
    tool: string;
    status: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    rawReport: unknown;
    createdAt: string;
};

export type GovernanceDecisionRecord = {
    id: string;
    repositoryId: string;
    riskLevel: string;
    autoMerge: boolean;
    blocked: boolean;
    reason: string;
    createdAt: string;
};

export type PipelineRecord = {
    id: string;
    repositoryId: string;
    name: string;
    yamlContent: string;
    createdAt: string;
};

export type RepositoryReference = {
    id: string;
    owner: string;
    name: string;
    url: string;
};

export type RepositorySummary = RepositoryReference & {
    defaultBranch: string;
    visibility: string;
    createdAt: string;
    analysis: AnalysisRecord | null;
    latestScan: SecurityScanRecord | null;
    latestGovernance: GovernanceDecisionRecord | null;
    latestPipeline: PipelineRecord | null;
};

export type RepositoryDetail = RepositoryReference & {
    defaultBranch: string;
    visibility: string;
    createdAt: string;
    analysis: AnalysisRecord | null;
    securityScans: SecurityScanRecord[];
    governanceDecisions: GovernanceDecisionRecord[];
    latestScan: SecurityScanRecord | null;
    latestGovernance: GovernanceDecisionRecord | null;
};

export type JobSummary = {
    id: string;
    state: string;
    progress: unknown;
    repositoryId: string | null;
    timestamp: number;
};

export type ComplianceSummary = {
    summary: {
        totalRepositories: number;
        compliantRepositories: number;
        nonCompliantRepositories: number;
        complianceRate: string;
    };
    latestScans: SecurityScanRecord[];
};

export type SecurityAdvisory = {
    id: string;
    summary: string;
    aliases: string[];
    severity: string[];
};

export type SecurityCorrelationSummary = {
    vulnerabilities: number;
    critical: boolean;
    advisories: SecurityAdvisory[];
};

export type DependencyRisk = {
    risk: string;
    recommendation: string;
    reason?: string | null;
};

export type RenovateEvaluation = {
    repository: RepositoryReference;
    dependency: string;
    newVersion: string;
    risk: DependencyRisk;
    security: SecurityCorrelationSummary | null;
    recommendation?: string;
    prTitle?: string | null;
    prUrl?: string | null;
    pullNumber?: number | null;
};

export type SecurityScanJobResponse = {
    message: string;
    jobId: string | number | null;
};

export type DependencyRefreshResponse = {
    success: boolean;
    message: string;
    repositoryId: string;
    evaluations: RenovateEvaluation[];
};

export type CICDProvider =
    | 'github-actions'
    | 'jenkins'
    | 'gitlab-ci'
    | 'circleci'
    | 'azure-pipelines'
    | 'security-workflow'
    | 'unknown';

export interface CICDDetectionRecord {
    provider: CICDProvider;
    name: string;
    path: string;
    detectedVia: 'github-api' | 'repository-file';
    isSecurityWorkflow: boolean;
}

export interface CheckRunRecord {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    detailsUrl: string | null;
    startedAt: string | null;
    completedAt: string | null;
    isSecurityGate: boolean;
}

export interface WorkflowRunRecord {
    id: number;
    name: string;
    workflowName: string;
    branch: string;
    event: string;
    status: string;
    conclusion: string | null;
    htmlUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CICDHealthRecord {
    overall: 'healthy' | 'warning' | 'critical' | 'unknown';
    summary: string;
    failingRuns: number;
    failedSecurityGates: number;
}

export interface GovernanceRecommendation {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

export interface StarterWorkflowRecommendation {
    title: string;
    rationale: string;
    deliveryModel: 'pull-request-recommendation-only' | string;
    yamlContent: string;
}

export interface CICDGovernanceOverlay {
    hasExistingCICD: boolean;
    detectedProviders: CICDDetectionRecord[];
    workflowRuns: WorkflowRunRecord[];
    checkRuns: CheckRunRecord[];
    failedSecurityGates: CheckRunRecord[];
    health: CICDHealthRecord;
    recommendations?: GovernanceRecommendation[];
    starterWorkflowRecommendation?: StarterWorkflowRecommendation | null;
    analyzerNotes: string[];
    analyzedAt: string;
}
