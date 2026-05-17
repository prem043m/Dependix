import * as vscode from 'vscode';
import { registerPlatformCommands } from './commands/platformCommands';
import { DependencyGovernanceTreeProvider } from './providers/dependencyGovernanceTreeProvider';
import { GovernanceAlertsTreeProvider } from './providers/governanceAlertsTreeProvider';
import { RepositoriesTreeProvider } from './providers/repositoriesTreeProvider';
import { ScanHistoryTreeProvider } from './providers/scanHistoryTreeProvider';
import { SecurityScansTreeProvider } from './providers/securityScansTreeProvider';
import { VulnerabilitiesTreeProvider } from './providers/vulnerabilitiesTreeProvider';
import { BackendApiClient } from './services/backendApiClient';
import { LiveUpdatesClient } from './sockets/liveUpdatesClient';

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel =
            vscode.window.createOutputChannel(
                'DevSecOps Assistant'
            );
    }

    return outputChannel;
}

export function activate(
    context: vscode.ExtensionContext
): void {
    const channel =
        getOutputChannel();

    const apiClient =
        new BackendApiClient(channel);

    const statusBarItem =
        vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

    statusBarItem.text =
        '$(broadcast) DevSecOps Active';
    statusBarItem.tooltip =
        'Universal Automated Dependency Management & DevSecOps Governance Platform';
    statusBarItem.show();

    const repositoriesProvider =
        new RepositoriesTreeProvider(
            apiClient,
            channel
        );

    const vulnerabilitiesProvider =
        new VulnerabilitiesTreeProvider(
            apiClient,
            channel
        );

    const dependencyGovernanceProvider =
        new DependencyGovernanceTreeProvider(
            apiClient,
            channel
        );

    const securityScansProvider =
        new SecurityScansTreeProvider(
            apiClient,
            channel
        );

    const scanHistoryProvider =
        new ScanHistoryTreeProvider(
            apiClient,
            channel
        );

    const governanceAlertsProvider =
        new GovernanceAlertsTreeProvider(
            apiClient,
            channel
        );

    const providers = [
        repositoriesProvider,
        vulnerabilitiesProvider,
        dependencyGovernanceProvider,
        securityScansProvider,
        scanHistoryProvider,
        governanceAlertsProvider
    ];

    const refreshAll =
        () => {
            providers.forEach(
                (provider) => provider.refresh()
            );
        };

    registerPlatformCommands(
        context,
        {
            apiClient,
            outputChannel: channel,
            refreshAll
        }
    );

    const liveUpdatesClient =
        new LiveUpdatesClient(
            apiClient.getBackendUrl(),
            channel,
            statusBarItem,
            refreshAll
        );

    liveUpdatesClient.connect();

    context.subscriptions.push(
        channel,
        statusBarItem,
        liveUpdatesClient,
        vscode.window.registerTreeDataProvider(
            'repositoriesView',
            repositoriesProvider
        ),
        vscode.window.registerTreeDataProvider(
            'vulnerabilitiesView',
            vulnerabilitiesProvider
        ),
        vscode.window.registerTreeDataProvider(
            'dependencyGovernanceView',
            dependencyGovernanceProvider
        ),
        vscode.window.registerTreeDataProvider(
            'securityScansView',
            securityScansProvider
        ),
        vscode.window.registerTreeDataProvider(
            'scanHistoryView',
            scanHistoryProvider
        ),
        vscode.window.registerTreeDataProvider(
            'governanceAlertsView',
            governanceAlertsProvider
        )
    );

    channel.appendLine(
        'DevSecOps Assistant activated'
    );
}

export function deactivate(): void {
    outputChannel?.appendLine(
        'DevSecOps Assistant deactivated'
    );
}
