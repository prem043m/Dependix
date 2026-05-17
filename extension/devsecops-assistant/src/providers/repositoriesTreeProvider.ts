import * as vscode from 'vscode';
import type { RepositorySummary } from '../models/platform';
import type { BackendApiClient } from '../services/backendApiClient';
import { formatDateTime } from '../utils/formatting';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import {
    RepositoryActionTreeItem,
    RepositoryMetricTreeItem,
    RepositoryTreeItem
} from './items';

export class RepositoriesTreeProvider
extends AsyncTreeProvider {

    constructor(
        private readonly apiClient: BackendApiClient,
        outputChannel: vscode.OutputChannel
    ) {
        super(outputChannel);
    }

    protected override async getNestedChildren(
        element: vscode.TreeItem
    ): Promise<vscode.TreeItem[]> {
        if (!(element instanceof RepositoryTreeItem)) {
            return [];
        }

        const repository =
            element.repository;

        return this.buildRepositoryChildren(repository);
    }

    protected async buildRootItems():
    Promise<vscode.TreeItem[]> {
        const repositories =
            await this.apiClient.listRepositories();

        return repositories.map(
            (repository) =>
                new RepositoryTreeItem(repository)
        );
    }

    protected getEmptyLabel(): string {
        return 'No repositories registered';
    }

    protected getEmptyDescription(): string {
        return 'Register a GitHub repository to start governance and scan workflows.';
    }

    private buildRepositoryChildren(
        repository: RepositorySummary
    ): vscode.TreeItem[] {
        return [
            new RepositoryActionTreeItem(
                'View Repository Details',
                {
                    command: 'devsecops.viewRepositoryDetails',
                    title: 'View Repository Details',
                    arguments: [repository]
                },
                'preview',
                'Open analysis, scan, and governance details'
            ),
            new RepositoryActionTreeItem(
                'Run Security Scan',
                {
                    command: 'devsecops.runSecurityScan',
                    title: 'Run Security Scan',
                    arguments: [repository]
                },
                'shield',
                'Queue a distributed security scan'
            ),
            new RepositoryActionTreeItem(
                'Analyze Workflow',
                {
                    command: 'devsecops.analyzeWorkflow',
                    title: 'Analyze Workflow',
                    arguments: [repository]
                },
                'symbol-method',
                'Open the generated CI policy and workflow view'
            ),
            new RepositoryActionTreeItem(
                'Check Dependencies',
                {
                    command: 'devsecops.checkDependencies',
                    title: 'Check Dependencies',
                    arguments: [repository]
                },
                'package',
                'Refresh Renovate governance for this repository'
            ),
            new RepositoryActionTreeItem(
                'Open GitHub Repository',
                {
                    command: 'devsecops.openRepository',
                    title: 'Open GitHub Repository',
                    arguments: [repository]
                },
                'link-external',
                repository.url
            ),
            new RepositoryMetricTreeItem(
                'Default Branch',
                repository.defaultBranch,
                'git-branch'
            ),
            new RepositoryMetricTreeItem(
                'Visibility',
                repository.visibility,
                'eye'
            ),
            new RepositoryMetricTreeItem(
                'Language',
                repository.analysis?.language ?? 'Unknown',
                'code'
            ),
            new RepositoryMetricTreeItem(
                'Framework',
                repository.analysis?.framework ?? 'Not detected',
                'symbol-class'
            ),
            new RepositoryMetricTreeItem(
                'Package Manager',
                repository.analysis?.packageManager ?? 'Not detected',
                'package'
            ),
            new RepositoryMetricTreeItem(
                'Latest Scan',
                repository.latestScan
                    ? `${repository.latestScan.tool} | ${repository.latestScan.status}`
                    : 'No completed scans yet',
                'shield'
            ),
            new RepositoryMetricTreeItem(
                'Latest Governance',
                repository.latestGovernance
                    ? `${repository.latestGovernance.riskLevel} | ${repository.latestGovernance.reason}`
                    : 'No governance decision yet',
                'law'
            ),
            new RepositoryMetricTreeItem(
                'Registered',
                formatDateTime(repository.createdAt),
                'calendar'
            )
        ];
    }
}
