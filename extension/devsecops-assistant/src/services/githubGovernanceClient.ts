import * as vscode from 'vscode';
import { ConfigurationService } from './configurationService';

type RepositoryCoordinates = {
    owner: string;
    repo: string;
};

type RepositoryFileDetection = {
    path: string;
    exists: boolean;
};

export class GitHubGovernanceClient {
    constructor(
        private readonly outputChannel: vscode.OutputChannel
    ) {}

    getRepositoryCoordinates(
        repositoryUrl: string
    ): RepositoryCoordinates | null {
        try {
            const parsed =
                new URL(repositoryUrl);

            if (parsed.hostname !== 'github.com') {
                return null;
            }

            const [owner, repo] =
                parsed.pathname
                    .replace(/^\/+|\/+$/g, '')
                    .split('/');

            if (!owner || !repo) {
                return null;
            }

            return {
                owner,
                repo: repo.replace(/\.git$/, '')
            };
        } catch {
            return null;
        }
    }

    async listActionsWorkflows(
        repositoryUrl: string
    ) {
        const octokit =
            await this.createOctokit();
        const coordinates =
            this.getRepositoryCoordinates(repositoryUrl);

        if (!octokit || !coordinates) {
            return [];
        }

        const response =
            await octokit.actions.listRepoWorkflows({
                owner: coordinates.owner,
                repo: coordinates.repo,
                per_page: 100
            });

        return response.data.workflows;
    }

    async listWorkflowRuns(
        repositoryUrl: string
    ) {
        const octokit =
            await this.createOctokit();
        const coordinates =
            this.getRepositoryCoordinates(repositoryUrl);

        if (!octokit || !coordinates) {
            return [];
        }

        const response =
            await octokit.actions.listWorkflowRunsForRepo({
                owner: coordinates.owner,
                repo: coordinates.repo,
                per_page: 20
            });

        return response.data.workflow_runs;
    }

    async listCheckRuns(
        repositoryUrl: string,
        branch: string
    ) {
        const octokit =
            await this.createOctokit();
        const coordinates =
            this.getRepositoryCoordinates(repositoryUrl);

        if (!octokit || !coordinates) {
            return [];
        }

        const branchResponse =
            await octokit.repos.getBranch({
                owner: coordinates.owner,
                repo: coordinates.repo,
                branch
            });

        const response =
            await octokit.checks.listForRef({
                owner: coordinates.owner,
                repo: coordinates.repo,
                ref: branchResponse.data.commit.sha,
                per_page: 100
            });

        return response.data.check_runs;
    }

    async detectRepositoryFiles(
        repositoryUrl: string,
        paths: string[]
    ): Promise<RepositoryFileDetection[]> {
        const octokit =
            await this.createOctokit();
        const coordinates =
            this.getRepositoryCoordinates(repositoryUrl);

        if (!octokit || !coordinates) {
            return [];
        }

        const results =
            await Promise.all(
                paths.map(async (path) => {
                    try {
                        await octokit.repos.getContent({
                            owner: coordinates.owner,
                            repo: coordinates.repo,
                            path
                        });

                        return {
                            path,
                            exists: true
                        };
                    } catch (error) {
                        if (
                            typeof error === 'object' &&
                            error &&
                            'status' in error &&
                            error.status === 404
                        ) {
                            return {
                                path,
                                exists: false
                            };
                        }

                        throw error;
                    }
                })
            );

        return results;
    }

    isConfigured(): boolean {
        return Boolean(
            ConfigurationService.getGitHubToken()
        );
    }

    private async createOctokit(): Promise<any> {
        const token =
            ConfigurationService.getGitHubToken();

        if (!token) {
            this.outputChannel.appendLine(
                'GitHub governance client skipped: no GitHub token configured.'
            );

            return null;
        }

        const { Octokit } =
            await import('@octokit/rest');

        return new Octokit({
            auth: token
        });
    }
}
