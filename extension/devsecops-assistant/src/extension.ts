import * as vscode from 'vscode';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { RepositoryTreeProvider } from './repositoryTreeProvider';
import { RenovateTreeProvider } from './renovateTreeProvider';

let outputChannel: vscode.OutputChannel | undefined;
let liveSocket: Socket | undefined;

type LiveEventPayload = {
    repositoryId?: string | null;
    status?: string;
    jobId?: string;
    error?: string;
    message?: string;
    risk?: string;
    recommendation?: string;
    reason?: string | null;
};

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel =
            vscode.window.createOutputChannel(
                'DevSecOps Assistant'
            );
    }

    return outputChannel;
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            return `Request failed with status ${error.response.status}`;
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Unknown error';
}

function updateStatusBar(
    statusBarItem: vscode.StatusBarItem,
    text: string,
    tooltip: string
): void {
    statusBarItem.text = text;
    statusBarItem.tooltip = tooltip;
    statusBarItem.show();
}

export function activate(context: vscode.ExtensionContext) {

    const channel = getOutputChannel();

    channel.appendLine(
        'DevSecOps Assistant activated'
    );

    const treeProvider =
        new RepositoryTreeProvider(channel);

    const renovateProvider =
        new RenovateTreeProvider(channel);

    const statusBarItem =
        vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

    updateStatusBar(
        statusBarItem,
        '$(plug) DevSecOps Connecting',
        'Connecting to the DevSecOps backend live event stream.'
    );

    const disposable = vscode.commands.registerCommand(
        'devsecops.runSecurityScan',

        async (repositoryId: string) => {

            vscode.window.showInformationMessage(
                `Running security scan for ${repositoryId}`
            );

            try {

                const response =
                    await axios.post(
                        `http://localhost:5000/security/${repositoryId}/run`,
                        undefined,
                        { timeout: 10000 }
                    );

                channel.appendLine(
                    `Security scan queued for ${repositoryId}: ${JSON.stringify(response.data)}`
                );

                vscode.window.showInformationMessage(
                    'Security scan queued successfully.'
                );

            } catch (error) {

                const message =
                    getErrorMessage(error);

                channel.appendLine(
                    `Security scan failed for ${repositoryId}: ${message}`
                );

                vscode.window.showErrorMessage(
                    `Security scan failed: ${message}`
                );
            }
        }
    );

    const dependencyCommand =
        vscode.commands.registerCommand(
            'devsecops.checkDependencies',

            async (repositoryId: string) => {

                vscode.window.showInformationMessage(
                    'Checking dependencies...'
                );

                try {

                    const response =
                        await axios.post(
                            `http://localhost:5000/dependencies/${repositoryId}/check`,
                            undefined,
                            { timeout: 10000 }
                        );

                    channel.appendLine(
                        `Dependency check started for ${repositoryId}: ${JSON.stringify(response.data)}`
                    );

                    vscode.window.showInformationMessage(
                        'Dependency check started'
                    );

                } catch (error) {

                    const message =
                        getErrorMessage(error);

                    channel.appendLine(
                        `Dependency scan failed for ${repositoryId}: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Dependency scan failed: ${message}`
                    );
                }
            }
        );

    const refreshCommand =
        vscode.commands.registerCommand(
            'devsecops.refreshRepositories',
            () => {
                treeProvider.refresh();
                renovateProvider.refresh();
                vscode.window.showInformationMessage(
                    'DevSecOps views refreshed'
                );
            }
        );

    const riskCommand =
        vscode.commands.registerCommand(
            'devsecops.evaluateDependencyRisk',

            async () => {

                vscode.window.showInformationMessage(
                    'Evaluating dependency risk...'
                );

                try {

                    const response =
                        await axios.post(
                            'http://localhost:5000/dependencies/evaluate'
                        );

                    const result =
                        response.data;

                    const risk =
                        result?.risk ??
                        result?.level ??
                        'UNKNOWN';

                    const reason =
                        result?.reason ??
                        result?.message ??
                        'No reason provided';

                    channel.appendLine(
                        `Dependency risk evaluation result: ${JSON.stringify(result)}`
                    );

                    vscode.window.showInformationMessage(
                        `${risk} Risk: ${reason}`
                    );

                    console.log(result);

                } catch (error) {

                    const message =
                        getErrorMessage(error);

                    channel.appendLine(
                        `Dependency risk evaluation failed: ${message}`
                    );

                    vscode.window.showErrorMessage(
                        `Risk evaluation failed: ${message}`
                    );
                }
            }
        );

    liveSocket = io(
        'http://localhost:5000',
        {
            reconnection: true,
            transports: ['websocket', 'polling']
        }
    );

    liveSocket.on(
        'connect',
        () => {
            channel.appendLine(
                'Live updates connected'
            );

            updateStatusBar(
                statusBarItem,
                '$(broadcast) DevSecOps Live',
                'Connected to backend live updates.'
            );

            treeProvider.refresh();
            renovateProvider.refresh();
        }
    );

    liveSocket.on(
        'disconnect',
        () => {
            channel.appendLine(
                'Live updates disconnected'
            );

            updateStatusBar(
                statusBarItem,
                '$(debug-disconnect) DevSecOps Offline',
                'Backend live updates are disconnected.'
            );
        }
    );

    liveSocket.on(
        'connect_error',
        (error: Error) => {
            channel.appendLine(
                `Live update connection error: ${error.message}`
            );

            updateStatusBar(
                statusBarItem,
                '$(warning) DevSecOps Offline',
                `Live update connection error: ${error.message}`
            );
        }
    );

    liveSocket.on(
        'scan-queued',
        (data: LiveEventPayload) => {
            channel.appendLine(
                `Scan queued event received for ${data.repositoryId ?? 'unknown repository'}`
            );

            updateStatusBar(
                statusBarItem,
                '$(clock) Scan queued',
                `Queued scan for ${data.repositoryId ?? 'unknown repository'}.`
            );
        }
    );

    liveSocket.on(
        'scan-started',
        (data: LiveEventPayload) => {
            channel.appendLine(
                `Scan started event received for ${data.repositoryId ?? 'unknown repository'}`
            );

            updateStatusBar(
                statusBarItem,
                '$(sync~spin) Scan running',
                `Security scan running for ${data.repositoryId ?? 'unknown repository'}.`
            );
        }
    );

    liveSocket.on(
        'scan-completed',
        (data: LiveEventPayload) => {
            const status =
                data.status ?? 'COMPLETED';

            channel.appendLine(
                `Scan completed event received for ${data.repositoryId ?? 'unknown repository'}: ${status}`
            );

            updateStatusBar(
                statusBarItem,
                '$(pass-filled) DevSecOps Active',
                `Last scan completed with status ${status}.`
            );

            treeProvider.refresh();
            renovateProvider.refresh();

            vscode.window.showInformationMessage(
                `Scan completed: ${status}`
            );
        }
    );

    liveSocket.on(
        'scan-failed',
        (data: LiveEventPayload) => {
            const message =
                data.error ?? 'Unknown error';

            channel.appendLine(
                `Scan failed event received for ${data.repositoryId ?? 'unknown repository'}: ${message}`
            );

            updateStatusBar(
                statusBarItem,
                '$(error) Scan failed',
                message
            );

            treeProvider.refresh();

            vscode.window.showErrorMessage(
                `Scan failed: ${message}`
            );
        }
    );

    liveSocket.on(
        'dependency-check-started',
        (data: LiveEventPayload) => {
            channel.appendLine(
                `Dependency check started for ${data.repositoryId ?? 'unknown repository'}`
            );

            updateStatusBar(
                statusBarItem,
                '$(sync~spin) Dependency check running',
                `Dependency check running for ${data.repositoryId ?? 'unknown repository'}.`
            );
        }
    );

    liveSocket.on(
        'dependency-check-completed',
        (data: LiveEventPayload) => {
            channel.appendLine(
                `Dependency check completed for ${data.repositoryId ?? 'unknown repository'}`
            );

            updateStatusBar(
                statusBarItem,
                '$(pass-filled) DevSecOps Active',
                data.message ?? 'Dependency check completed.'
            );

            renovateProvider.refresh();

            vscode.window.showInformationMessage(
                data.message ?? 'Dependency check completed'
            );
        }
    );

    liveSocket.on(
        'dependency-risk-evaluated',
        (data: LiveEventPayload) => {
            const risk =
                data.risk ?? 'UNKNOWN';

            const summary =
                `${risk} Risk: ${data.reason ?? data.recommendation ?? 'Manual review required'}`;

            channel.appendLine(
                `Dependency risk event received: ${summary}`
            );

            if (risk === 'HIGH') {
                vscode.window.showWarningMessage(summary);
                return;
            }

            vscode.window.showInformationMessage(summary);
        }
    );

    const treeViewDisposable =
        vscode.window.registerTreeDataProvider(
        'devsecopsSidebar',
        treeProvider
    );

    const renovateTreeViewDisposable =
        vscode.window.registerTreeDataProvider(
            'renovateSidebar',
            renovateProvider
        );

    context.subscriptions.push(
        channel,
        disposable,
        dependencyCommand,
        refreshCommand,
        riskCommand,
        statusBarItem,
        treeViewDisposable,
        renovateTreeViewDisposable,
        {
            dispose: () => {
                liveSocket?.disconnect();
                liveSocket = undefined;
            }
        }
    );
}

export function deactivate() {
    outputChannel?.appendLine(
        'DevSecOps Assistant deactivated'
    );
}
