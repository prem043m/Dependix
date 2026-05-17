import * as vscode from 'vscode';
import type {
    RenovateEvaluation,
    RepositorySummary
} from '../models/platform';
import {
    DependencyTreeItem,
    GovernanceAlertTreeItem,
    RepositoryTreeItem,
    SecurityScanTreeItem,
    VulnerabilityTreeItem
} from '../providers/items';
import type { BackendApiClient } from '../services/backendApiClient';
import { getErrorMessage } from '../utils/errors';
import { PlatformDetailsPanel } from '../webviews/platformDetailsPanel';

type CommandDependencies = {
    apiClient: BackendApiClient;
    outputChannel: vscode.OutputChannel;
    refreshAll: () => void;
};

export function registerPlatformCommands(
    context: vscode.ExtensionContext,
    dependencies: CommandDependencies
): void {
    const {
        apiClient,
        outputChannel,
        refreshAll
    } = dependencies;

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'devsecops.registerRepository',
            async () => {
                const repoUrl =
                    await vscode.window.showInputBox({
                        title: 'Register Repository',
                        prompt: 'Enter the GitHub repository URL to register',
                        ignoreFocusOut: true,
                        validateInput: (value) => (
                            /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(value.trim())
                                ? undefined
                                : 'Enter a valid GitHub repository URL.'
                        )
                    });

                if (!repoUrl) {
                    return;
                }

                try {
                    const repository =
                        await apiClient.registerRepository(
                            repoUrl.trim()
                        );

                    refreshAll();

                    const detail =
                        await apiClient.getRepository(
                            repository.id
                        );

                    const pipeline =
                        await apiClient.getLatestPipeline(
                            repository.id
                        );

                    PlatformDetailsPanel.showRepositoryDetails(
                        detail,
                        pipeline
                    );
                } catch (error) {
                    const message =
                        getErrorMessage(error);

                    outputChannel.appendLine(
                        `Repository registration failed: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Repository registration failed: ${message}`
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.refreshPlatform',
            () => {
                refreshAll();
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.runSecurityScan',
            async (target: unknown) => {
                const repository =
                    getRepositoryFromTarget(target);

                if (!repository) {
                    return;
                }

                try {
                    const result =
                        await apiClient.runSecurityScan(
                            repository.id
                        );

                    outputChannel.appendLine(
                        `Security scan queued for ${repository.owner}/${repository.name}: ${JSON.stringify(result)}`
                    );
                } catch (error) {
                    const message =
                        getErrorMessage(error);

                    outputChannel.appendLine(
                        `Security scan request failed: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Security scan request failed: ${message}`
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.checkDependencies',
            async (target: unknown) => {
                const repository =
                    getRepositoryFromTarget(target);

                if (!repository) {
                    return;
                }

                try {
                    const result =
                        await apiClient.refreshDependencies(
                            repository.id
                        );

                    outputChannel.appendLine(
                        `Dependency governance refreshed for ${repository.owner}/${repository.name}: ${result.evaluations.length} evaluations`
                    );

                    refreshAll();
                } catch (error) {
                    const message =
                        getErrorMessage(error);

                    outputChannel.appendLine(
                        `Dependency refresh failed: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Dependency refresh failed: ${message}`
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.analyzeWorkflow',
            async (target: unknown) => {
                const repository =
                    getRepositoryFromTarget(target);

                if (!repository) {
                    return;
                }

                try {
                    const detail =
                        await apiClient.getRepository(
                            repository.id
                        );

                    const existingPipeline =
                        await apiClient.getLatestPipeline(
                            repository.id
                        );

                    const pipeline =
                        existingPipeline ??
                        await apiClient.generatePipeline(
                            repository.id
                        );

                    PlatformDetailsPanel.showRepositoryDetails(
                        detail,
                        pipeline
                    );

                    refreshAll();
                } catch (error) {
                    const message =
                        getErrorMessage(error);

                    outputChannel.appendLine(
                        `Workflow analysis failed: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Workflow analysis failed: ${message}`
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.openRepository',
            async (target: unknown) => {
                const repository =
                    getRepositoryFromTarget(target);

                if (!repository) {
                    return;
                }

                await vscode.env.openExternal(
                    vscode.Uri.parse(repository.url)
                );
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.viewRepositoryDetails',
            async (target: unknown) => {
                const repository =
                    getRepositoryFromTarget(target);

                if (!repository) {
                    return;
                }

                try {
                    const detail =
                        await apiClient.getRepository(
                            repository.id
                        );

                    const pipeline =
                        await apiClient.getLatestPipeline(
                            repository.id
                        );

                    PlatformDetailsPanel.showRepositoryDetails(
                        detail,
                        pipeline
                    );
                } catch (error) {
                    const message =
                        getErrorMessage(error);

                    outputChannel.appendLine(
                        `Failed to open repository details: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Failed to open repository details: ${message}`
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.openRenovatePullRequest',
            async (target: unknown) => {
                const evaluation =
                    getEvaluationFromTarget(target);

                if (!evaluation?.prUrl) {
                    return;
                }

                await vscode.env.openExternal(
                    vscode.Uri.parse(evaluation.prUrl)
                );
            }
        ),
        vscode.commands.registerCommand(
            'devsecops.viewDependencyDetails',
            (target: unknown) => {
                const evaluation =
                    getEvaluationFromTarget(target);

                if (!evaluation) {
                    return;
                }

                PlatformDetailsPanel.showDependencyDetails(
                    evaluation
                );
            }
        )
    );
}

function getRepositoryFromTarget(
    target: unknown
): RepositorySummary | null {
    if (target instanceof RepositoryTreeItem) {
        return target.repository;
    }

    if (target instanceof VulnerabilityTreeItem) {
        return target.repository;
    }

    if (target instanceof SecurityScanTreeItem) {
        return target.repository;
    }

    if (target instanceof GovernanceAlertTreeItem) {
        return target.repository;
    }

    if (isRepositorySummary(target)) {
        return target;
    }

    return null;
}

function getEvaluationFromTarget(
    target: unknown
): RenovateEvaluation | null {
    if (target instanceof DependencyTreeItem) {
        return target.evaluation;
    }

    if (isRenovateEvaluation(target)) {
        return target;
    }

    return null;
}

function isRepositorySummary(
    value: unknown
): value is RepositorySummary {
    return Boolean(
        value &&
        typeof value === 'object' &&
        'id' in value &&
        'owner' in value &&
        'name' in value &&
        'url' in value
    );
}

function isRenovateEvaluation(
    value: unknown
): value is RenovateEvaluation {
    return Boolean(
        value &&
        typeof value === 'object' &&
        'dependency' in value &&
        'newVersion' in value &&
        'repository' in value
    );
}
