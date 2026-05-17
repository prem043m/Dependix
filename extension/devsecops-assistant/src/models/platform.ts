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
