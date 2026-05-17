import * as vscode from 'vscode';
import axios from 'axios';

type RenovateEvaluation = {
    dependency?: string;
    newVersion?: string;
    risk?: {
        risk?: string;
        recommendation?: string;
        reason?: string;
    };
    security?: {
        vulnerabilities?: number;
        critical?: boolean;
    } | null;
    recommendation?: string;
    prTitle?: string | null;
    prUrl?: string | null;
};

export class RenovateTreeProvider
implements vscode.TreeDataProvider<vscode.TreeItem> {

    private readonly onDidChangeTreeDataEmitter =
        new vscode.EventEmitter<vscode.TreeItem | undefined>();

    readonly onDidChangeTreeData =
        this.onDidChangeTreeDataEmitter.event;

    constructor(
        private readonly outputChannel: vscode.OutputChannel
    ) {}

    refresh(): void {
        this.onDidChangeTreeDataEmitter.fire(undefined);
    }

    getTreeItem(
        element: vscode.TreeItem
    ): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<vscode.TreeItem[]> {
        try {
            const response =
                await axios.get(
                    'http://localhost:5000/governance/renovate',
                    { timeout: 10000 }
                );

            const evaluations =
                Array.isArray(response.data?.evaluations)
                    ? response.data.evaluations
                    : [];

            if (evaluations.length === 0) {
                return [
                    this.createInfoItem(
                        'No Renovate PRs found',
                        'Open Renovate pull requests will appear here.'
                    )
                ];
            }

            return evaluations.map(
                (evaluation: RenovateEvaluation) => {
                    const dependency =
                        evaluation.dependency ?? 'Unknown dependency';

                    const version =
                        evaluation.newVersion ?? 'unknown';

                    const risk =
                        evaluation.risk?.risk ?? 'UNKNOWN';

                    const vulnerabilities =
                        evaluation.security?.vulnerabilities ?? 0;

                    const recommendation =
                        evaluation.recommendation ??
                        evaluation.risk?.recommendation ??
                        'Manual review required';

                    const item =
                        new vscode.TreeItem(
                            `${this.getRiskBadge(risk)} ${dependency} -> ${version}`,
                            vscode.TreeItemCollapsibleState.None
                        );

                    item.description =
                        `Risk: ${risk} | CVEs: ${vulnerabilities}`;

                    item.tooltip =
                        new vscode.MarkdownString(
                            [
                                `**${dependency}** -> **${version}**`,
                                '',
                                `Risk: ${risk}`,
                                `CVEs: ${vulnerabilities}`,
                                evaluation.security?.critical
                                    ? 'Critical vulnerabilities detected: yes'
                                    : '',
                                `Recommendation: ${recommendation}`,
                                evaluation.risk?.reason
                                    ? `Reason: ${evaluation.risk.reason}`
                                    : '',
                                evaluation.prTitle
                                    ? `PR: ${evaluation.prTitle}`
                                    : '',
                                evaluation.prUrl
                                    ? `Link: ${evaluation.prUrl}`
                                    : ''
                            ].filter(Boolean).join('\n')
                        );

                    item.iconPath =
                        this.getRiskIcon(risk);

                    if (evaluation.prUrl) {
                        item.command = {
                            command: 'vscode.open',
                            title: 'Open Pull Request',
                            arguments: [vscode.Uri.parse(evaluation.prUrl)]
                        };
                    }

                    return item;
                }
            );
        } catch (error) {
            const message =
                axios.isAxiosError(error)
                    ? error.response?.data?.message ?? error.message
                    : error instanceof Error
                        ? error.message
                        : 'Unknown error';

            this.outputChannel.appendLine(
                `Failed to load Renovate governance: ${message}`
            );

            return [
                this.createInfoItem(
                    'Renovate governance unavailable',
                    message
                )
            ];
        }
    }

    private createInfoItem(
        label: string,
        description?: string
    ): vscode.TreeItem {
        const item =
            new vscode.TreeItem(
                label,
                vscode.TreeItemCollapsibleState.None
            );

        item.description = description;
        item.iconPath =
            new vscode.ThemeIcon('info');

        return item;
    }

    private getRiskIcon(
        risk: string
    ): vscode.ThemeIcon {
        switch (risk) {
        case 'HIGH':
        case 'MANUAL_REVIEW':
            return new vscode.ThemeIcon(
                'warning',
                new vscode.ThemeColor('problemsWarningIcon.foreground')
            );
        case 'MEDIUM':
            return new vscode.ThemeIcon(
                'alert',
                new vscode.ThemeColor('problemsWarningIcon.foreground')
            );
        case 'LOW':
            return new vscode.ThemeIcon(
                'pass-filled',
                new vscode.ThemeColor('testing.iconPassed')
            );
        default:
            return new vscode.ThemeIcon('question');
        }
    }

    private getRiskBadge(
        risk: string
    ): string {
        switch (risk) {
        case 'LOW':
            return '[LOW]';
        case 'MEDIUM':
            return '[MEDIUM]';
        case 'HIGH':
        case 'MANUAL_REVIEW':
            return '[HIGH]';
        default:
            return '[UNKNOWN]';
        }
    }
}
