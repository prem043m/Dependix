import * as vscode from 'vscode';
import type { BackendApiClient } from '../services/backendApiClient';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import { SecurityScanTreeItem } from './items';

export class SecurityScansTreeProvider
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
                (repository) => repository.latestScan !== null
            )
            .map(
                (repository) =>
                    new SecurityScanTreeItem(
                        repository,
                        repository.latestScan!
                    )
            );
    }

    protected getEmptyLabel(): string {
        return 'No completed scans';
    }

    protected getEmptyDescription(): string {
        return 'Security scan summaries will appear here after the worker persists results.';
    }
}
