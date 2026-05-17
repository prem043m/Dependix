import * as vscode from 'vscode';
import type { BackendApiClient } from '../services/backendApiClient';
import { AsyncTreeProvider } from './base/asyncTreeProvider';
import { ScanHistoryTreeItem } from './items';

export class ScanHistoryTreeProvider
extends AsyncTreeProvider {

    constructor(
        private readonly apiClient: BackendApiClient,
        outputChannel: vscode.OutputChannel
    ) {
        super(outputChannel);
    }

    protected async buildRootItems():
    Promise<vscode.TreeItem[]> {
        const [jobs, repositories] =
            await Promise.all([
                this.apiClient.getJobs(),
                this.apiClient.listRepositories()
            ]);

        const repositoryNames =
            new Map(
                repositories.map((repository) => ([
                    repository.id,
                    `${repository.owner}/${repository.name}`
                ]))
            );

        return jobs
            .sort(
                (left, right) =>
                    right.timestamp - left.timestamp
            )
            .map(
                (job) =>
                    new ScanHistoryTreeItem(
                        job,
                        job.repositoryId
                            ? repositoryNames.get(job.repositoryId) ?? 'Unknown repository'
                            : 'Unknown repository'
                    )
            );
    }

    protected getEmptyLabel(): string {
        return 'No scan history yet';
    }

    protected getEmptyDescription(): string {
        return 'BullMQ job history will appear here as the backend processes scans.';
    }
}
