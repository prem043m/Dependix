import * as vscode from 'vscode';
import type { BackendApiClient } from '../services/backendApiClient';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import { GovernanceAlertTreeItem } from './items';

export class GovernanceAlertsTreeProvider
extends AsyncTreeProvider {

    constructor(
        private readonly apiClient: BackendApiClient,
        outputChannel: vscode.OutputChannel
    ) {
        super(outputChannel);
    }

    protected async buildRootItems():
    Promise<vscode.TreeItem[]> {
        const repositories =
            await this.apiClient.listRepositories();

        return repositories
            .filter(
                (repository) =>
                    repository.latestGovernance !== null &&
                    (
                        repository.latestGovernance.blocked ||
                        repository.latestGovernance.riskLevel.toUpperCase() !== 'LOW'
                    )
            )
            .map(
                (repository) =>
                    new GovernanceAlertTreeItem(
                        repository,
                        repository.latestGovernance!
                    )
            );
    }

    protected getEmptyLabel(): string {
        return 'No governance alerts';
    }

    protected getEmptyDescription(): string {
        return 'High-risk recommendations and blocked decisions will surface here.';
    }
}
