import * as vscode from 'vscode';
import type {
    GovernanceDecisionRecord,
    JobSummary,
    RenovateEvaluation,
    RepositorySummary,
    SecurityScanRecord
} from '../models/platform';
import {
    getGovernanceIcon,
    getRiskBadge,
    getRiskIcon,
    getScanStatusIcon,
    getSeveritySummary
} from '../utils/badges';
import { formatDateTime } from '../utils/formatting';

export class InfoTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        description?: string
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None
        );

        this.description = description;
        this.iconPath =
            new vscode.ThemeIcon('info');
        this.contextValue = 'info';
    }
}

export class RepositoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly repository: RepositorySummary
    ) {
        super(
            `${repository.owner}/${repository.name}`,
            vscode.TreeItemCollapsibleState.Collapsed
        );

        this.description =
            repository.analysis?.language ??
            repository.visibility;
        this.tooltip =
            `${repository.url}\nDefault branch: ${repository.defaultBranch}`;
        this.iconPath =
            new vscode.ThemeIcon('repo');
        this.contextValue = 'repository';
    }
}

export class RepositoryActionTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        command: vscode.Command,
        iconId: string,
        description?: string
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None
        );

        this.command = command;
        this.description = description;
        this.iconPath =
            new vscode.ThemeIcon(iconId);
        this.contextValue = 'repositoryAction';
    }
}

export class RepositoryMetricTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        description?: string,
        iconId = 'symbol-property'
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None
        );

        this.description = description;
        this.iconPath =
            new vscode.ThemeIcon(iconId);
        this.contextValue = 'repositoryMetric';
    }
}

export class VulnerabilityTreeItem extends vscode.TreeItem {
    constructor(
        public readonly repository: RepositorySummary,
        public readonly scan: SecurityScanRecord
    ) {
        super(
            `${repository.owner}/${repository.name}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.description =
            `${scan.tool} | ${getSeveritySummary(scan)}`;
        this.tooltip =
            `${scan.tool} scan on ${formatDateTime(scan.createdAt)}`;
        this.iconPath =
            getScanStatusIcon(scan.status);
        this.contextValue = 'vulnerability';
        this.command = {
            command: 'devsecops.viewRepositoryDetails',
            title: 'View Repository Details',
            arguments: [this]
        };
    }
}

export class DependencyTreeItem extends vscode.TreeItem {
    constructor(
        public readonly evaluation: RenovateEvaluation
    ) {
        super(
            `${evaluation.repository.owner}/${evaluation.repository.name}: ${evaluation.dependency} -> ${evaluation.newVersion}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.description =
            `${getRiskBadge(evaluation.risk.risk)} | CVEs ${evaluation.security?.vulnerabilities ?? 0}`;
        this.tooltip =
            `${evaluation.risk.recommendation}\n${evaluation.prUrl ?? ''}`;
        this.iconPath =
            getRiskIcon(evaluation.risk.risk);
        this.contextValue = 'dependency';
        this.command = {
            command: 'devsecops.viewDependencyDetails',
            title: 'View Dependency Details',
            arguments: [this]
        };
    }
}

export class SecurityScanTreeItem extends vscode.TreeItem {
    constructor(
        public readonly repository: RepositorySummary,
        public readonly scan: SecurityScanRecord
    ) {
        super(
            `${repository.owner}/${repository.name}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.description =
            `${scan.tool} | ${scan.status}`;
        this.tooltip =
            `${getSeveritySummary(scan)}\n${formatDateTime(scan.createdAt)}`;
        this.iconPath =
            getScanStatusIcon(scan.status);
        this.contextValue = 'securityScan';
        this.command = {
            command: 'devsecops.viewRepositoryDetails',
            title: 'View Repository Details',
            arguments: [this]
        };
    }
}

export class ScanHistoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly job: JobSummary,
        repositoryName: string
    ) {
        super(
            `Job ${job.id}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.description =
            `${job.state} | ${repositoryName}`;
        this.tooltip =
            `Recorded ${formatDateTime(job.timestamp)}`;
        this.iconPath =
            new vscode.ThemeIcon('history');
        this.contextValue = 'scanHistory';
    }
}

export class GovernanceAlertTreeItem extends vscode.TreeItem {
    constructor(
        public readonly repository: RepositorySummary,
        public readonly decision: GovernanceDecisionRecord
    ) {
        super(
            `${repository.owner}/${repository.name}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.description =
            `${decision.riskLevel} | ${decision.reason}`;
        this.tooltip =
            `Governance decision recorded ${formatDateTime(decision.createdAt)}`;
        this.iconPath =
            getGovernanceIcon(decision);
        this.contextValue = 'governanceAlert';
        this.command = {
            command: 'devsecops.viewRepositoryDetails',
            title: 'View Repository Details',
            arguments: [this]
        };
    }
}
