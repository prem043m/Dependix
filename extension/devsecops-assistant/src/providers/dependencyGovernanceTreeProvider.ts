import * as vscode from 'vscode';
import type { BackendApiClient } from '../services/backendApiClient';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import { DependencyTreeItem } from './items';

export class DependencyGovernanceTreeProvider
extends AsyncTreeProvider {

    constructor(
        private readonly apiClient: BackendApiClient,
        outputChannel: vscode.OutputChannel
    ) {
        super(outputChannel);
    }

    protected async buildRootItems():
    Promise<vscode.TreeItem[]> {
        const evaluations =
            await this.apiClient.getRenovateGovernance();

        return evaluations.map(
            (evaluation) =>
                new DependencyTreeItem(evaluation)
        );
    }

    protected getEmptyLabel(): string {
        return 'No open Renovate governance items';
    }

    protected getEmptyDescription(): string {
        return 'Real Renovate PR intelligence will appear here when repositories have open dependency updates.';
    }
}
