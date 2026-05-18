import * as vscode from 'vscode';
import type {
    CICDGovernanceOverlay,
    RepositoryDetail
} from '../models/platform';
import { CICDDetectionService } from './cicdDetectionService';
import { GitHubGovernanceClient } from './githubGovernanceClient';
import { GovernanceCorrelationEngine } from './governanceCorrelationEngine';
import { WorkflowStatusParser } from './workflowStatusParser';

export class WorkflowAnalyzer {
    constructor(
        private readonly githubClient: GitHubGovernanceClient,
        private readonly detectionService: CICDDetectionService,
        private readonly statusParser: WorkflowStatusParser,
        private readonly correlationEngine: GovernanceCorrelationEngine,
        private readonly outputChannel: vscode.OutputChannel
    ) {}

    async analyze(
        repository: RepositoryDetail
    ): Promise<CICDGovernanceOverlay> {
        const notes: string[] = [];
        const detectedProviders =
            await this.detectionService.detectExistingCICD(
                repository.url
            );

        if (!this.githubClient.isConfigured()) {
            notes.push(
                'Configure devsecops.githubToken to enable Octokit-based workflow runs, check runs, and GitHub governance insights.'
            );
        }

        let workflowRunsRaw: Awaited<
            ReturnType<GitHubGovernanceClient['listWorkflowRuns']>
        > = [];
        let checkRunsRaw: Awaited<
            ReturnType<GitHubGovernanceClient['listCheckRuns']>
        > = [];

        try {
            workflowRunsRaw =
                await this.githubClient.listWorkflowRuns(
                    repository.url
                );
            checkRunsRaw =
                await this.githubClient.listCheckRuns(
                    repository.url,
                    repository.defaultBranch
                );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            this.outputChannel.appendLine(
                `Workflow analysis degraded for ${repository.owner}/${repository.name}: ${message}`
            );

            notes.push(
                `GitHub workflow telemetry could not be fully read: ${message}`
            );
        }

        const workflowRuns =
            this.statusParser.parseWorkflowRuns(
                workflowRunsRaw
            );
        const checkRuns =
            this.statusParser.parseCheckRuns(
                checkRunsRaw
            );
        const failedSecurityGates =
            checkRuns.filter(
                (run) =>
                    run.isSecurityGate &&
                    run.conclusion === 'failure'
            );
        const health =
            this.statusParser.buildHealthRecord(
                workflowRuns,
                checkRuns
            );

        const baseOverlay =
            {
                hasExistingCICD:
                    detectedProviders.length > 0,
                detectedProviders,
                workflowRuns,
                checkRuns,
                failedSecurityGates,
                health,
                analyzerNotes: notes,
                analyzedAt: new Date().toISOString()
            };

        const correlated =
            this.correlationEngine.correlate(
                repository,
                baseOverlay
            );

        return {
            ...baseOverlay,
            ...correlated
        };
    }
}
