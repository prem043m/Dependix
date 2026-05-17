import * as vscode from 'vscode';
import type { BackendApiClient } from '../services/backendApiClient';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import { VulnerabilityTreeItem } from './items';

export class VulnerabilitiesTreeProvider
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
                    repository.latestScan !== null &&
                    (
                        repository.latestScan.status === 'FAILED' ||
                        repository.latestScan.critical > 0 ||
                        repository.latestScan.high > 0 ||
                        repository.latestScan.medium > 0 ||
                        repository.latestScan.low > 0
                    )
            )
            .map(
                (repository) =>
                    new VulnerabilityTreeItem(
                        repository,
                        repository.latestScan!
                    )
            );
    }

    protected getEmptyLabel(): string {
        return 'No vulnerability alerts';
    }

    protected getEmptyDescription(): string {
        return 'Live security findings will appear here after repository scans complete.';
    }
}
