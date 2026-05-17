import * as vscode from 'vscode';
import {
    io,
    type Socket
} from 'socket.io-client';

type LiveEventPayload = {
    repositoryId?: string | null;
    repositoryName?: string;
    status?: string;
    message?: string;
    error?: string;
    risk?: string;
    recommendation?: string;
    reason?: string | null;
    evaluationsCount?: number;
    highRiskCount?: number;
};

export class LiveUpdatesClient
implements vscode.Disposable {

    private socket: Socket | undefined;

    constructor(
        private readonly backendUrl: string,
        private readonly outputChannel: vscode.OutputChannel,
        private readonly statusBarItem: vscode.StatusBarItem,
        private readonly refreshAll: () => void
    ) {}

    connect(): void {
        this.setStatus(
            '$(plug) DevSecOps Connecting',
            'Connecting to live backend events.'
        );

        this.socket = io(
            this.backendUrl,
            {
                reconnection: true,
                transports: [
                    'websocket',
                    'polling'
                ]
            }
        );

        this.socket.on(
            'connect',
            () => {
                this.outputChannel.appendLine(
                    'Live updates connected'
                );

                this.setStatus(
                    '$(broadcast) DevSecOps Live',
                    'Connected to backend live updates.'
                );

                this.refreshAll();
            }
        );

        this.socket.on(
            'disconnect',
            () => {
                this.outputChannel.appendLine(
                    'Live updates disconnected'
                );

                this.setStatus(
                    '$(debug-disconnect) DevSecOps Offline',
                    'Backend live updates are disconnected.'
                );
            }
        );

        this.socket.on(
            'connect_error',
            (error: Error) => {
                this.outputChannel.appendLine(
                    `Live connection error: ${error.message}`
                );

                this.setStatus(
                    '$(warning) DevSecOps Offline',
                    `Live update connection error: ${error.message}`
                );
            }
        );

        this.socket.on(
            'repository-registered',
            (data: LiveEventPayload) => {
                this.outputChannel.appendLine(
                    `Repository registered: ${data.repositoryName ?? data.repositoryId ?? 'unknown'}`
                );

                this.setStatus(
                    '$(repo-create) Repository registered',
                    data.repositoryName ?? 'Repository registered.'
                );

                this.refreshAll();
            }
        );

        this.socket.on(
            'scan-queued',
            (data: LiveEventPayload) => {
                this.setStatus(
                    '$(clock) Scan queued',
                    data.repositoryId ?? 'Security scan queued.'
                );
            }
        );

        this.socket.on(
            'scan-started',
            (data: LiveEventPayload) => {
                this.setStatus(
                    '$(sync~spin) Scan running',
                    data.repositoryId ?? 'Security scan running.'
                );
            }
        );

        this.socket.on(
            'scan-completed',
            (data: LiveEventPayload) => {
                this.outputChannel.appendLine(
                    `Scan completed: ${data.repositoryId ?? 'unknown'} -> ${data.status ?? 'COMPLETED'}`
                );

                this.setStatus(
                    '$(pass-filled) DevSecOps Active',
                    `Latest scan completed with status ${data.status ?? 'COMPLETED'}.`
                );

                this.refreshAll();
            }
        );

        this.socket.on(
            'scan-failed',
            (data: LiveEventPayload) => {
                this.outputChannel.appendLine(
                    `Scan failed: ${data.repositoryId ?? 'unknown'} -> ${data.error ?? 'Unknown error'}`
                );

                this.setStatus(
                    '$(error) Scan failed',
                    data.error ?? 'Security scan failed.'
                );

                this.refreshAll();
            }
        );

        this.socket.on(
            'dependency-check-started',
            (data: LiveEventPayload) => {
                this.setStatus(
                    '$(sync~spin) Dependency governance running',
                    data.repositoryName ?? 'Dependency governance refresh started.'
                );
            }
        );

        this.socket.on(
            'dependency-check-completed',
            (data: LiveEventPayload) => {
                this.outputChannel.appendLine(
                    `Dependency governance refreshed: ${data.repositoryName ?? data.repositoryId ?? 'unknown'}`
                );

                this.setStatus(
                    '$(pass-filled) DevSecOps Active',
                    `${data.repositoryName ?? 'Repository'} dependency governance refreshed.`
                );

                this.refreshAll();
            }
        );

        this.socket.on(
            'dependency-risk-evaluated',
            (data: LiveEventPayload) => {
                this.outputChannel.appendLine(
                    `Dependency risk evaluated: ${data.risk ?? 'UNKNOWN'}`
                );
            }
        );
    }

    dispose(): void {
        this.socket?.disconnect();
        this.socket = undefined;
    }

    private setStatus(
        text: string,
        tooltip: string
    ): void {
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }
}
