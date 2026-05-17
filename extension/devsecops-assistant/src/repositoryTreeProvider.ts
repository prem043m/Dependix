import * as vscode from 'vscode';
import axios from 'axios';

type RepositoryRecord = {
    id: string;
    name: string;
};

type SidebarSection =
    | 'overview'
    | 'actions'
    | 'repositories';

type SidebarNodeKind =
    | 'section'
    | 'status'
    | 'command'
    | 'repository'
    | 'repositoryInfo'
    | 'empty';

type SectionNode = {
    kind: 'section';
    section: SidebarSection;
    label: string;
    description?: string;
};

type StatusNode = {
    kind: 'status';
    label: string;
    description?: string;
    tooltip?: string;
    icon: vscode.ThemeIcon;
};

type CommandNode = {
    kind: 'command';
    label: string;
    description?: string;
    tooltip?: string;
    icon: vscode.ThemeIcon;
    command: vscode.Command;
};

type RepositoryNode = {
    kind: 'repository';
    repository: RepositoryRecord;
};

type RepositoryInfoNode = {
    kind: 'repositoryInfo';
    label: string;
    description?: string;
    tooltip?: string;
    icon: vscode.ThemeIcon;
};

type EmptyNode = {
    kind: 'empty';
    label: string;
    description?: string;
    tooltip?: string;
};

type SidebarNode =
    | SectionNode
    | StatusNode
    | CommandNode
    | RepositoryNode
    | RepositoryInfoNode
    | EmptyNode;

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export class RepositoryTreeProvider
implements vscode.TreeDataProvider<SidebarNode> {

    private readonly onDidChangeTreeDataEmitter =
        new vscode.EventEmitter<SidebarNode | undefined>();

    readonly onDidChangeTreeData =
        this.onDidChangeTreeDataEmitter.event;

    private repositories: RepositoryRecord[] = [];
    private loadState: LoadState = 'idle';
    private lastErrorMessage?: string;

    constructor(
        private readonly outputChannel: vscode.OutputChannel
    ) {}

    refresh(): void {
        this.loadState = 'idle';
        this.onDidChangeTreeDataEmitter.fire(undefined);
    }

    getTreeItem(
        element: SidebarNode
    ): vscode.TreeItem {

        switch (element.kind) {
        case 'section':
            return this.createSectionItem(element);
        case 'status':
            return this.createStatusItem(element);
        case 'command':
            return this.createCommandItem(element);
        case 'repository':
            return this.createRepositoryItem(element);
        case 'repositoryInfo':
            return this.createRepositoryInfoItem(element);
        case 'empty':
            return this.createEmptyItem(element);
        }
    }

    async getChildren(
        element?: SidebarNode
    ): Promise<SidebarNode[]> {

        if (!element) {
            await this.ensureRepositoriesLoaded();

            return [
                {
                    kind: 'section',
                    section: 'overview',
                    label: 'Security Overview',
                    description: this.getOverviewDescription()
                },
                {
                    kind: 'section',
                    section: 'actions',
                    label: 'Quick Actions',
                    description: 'Refresh and run checks'
                },
                {
                    kind: 'section',
                    section: 'repositories',
                    label: 'Repositories',
                    description: this.getRepositoriesDescription()
                }
            ];
        }

        if (element.kind === 'section') {
            return this.getSectionChildren(element.section);
        }

        if (element.kind === 'repository') {
            return this.getRepositoryChildren(element.repository);
        }

        return [];
    }

    private async ensureRepositoriesLoaded(): Promise<void> {
        if (this.loadState === 'ready' || this.loadState === 'loading') {
            return;
        }

        this.loadState = 'loading';
        this.lastErrorMessage = undefined;

        try {
            const response =
                await axios.get(
                    'http://localhost:5000/repositories',
                    { timeout: 10000 }
                );

            const repositories =
                response.data.repositories;

            if (!Array.isArray(repositories)) {
                throw new Error(
                    'Repository endpoint returned an unexpected payload.'
                );
            }

            this.repositories = repositories.map(
                (repo: any, index: number) => ({
                    id: String(repo.id ?? `repo-${index + 1}`),
                    name: repo.name ?? 'Unnamed repository'
                })
            );

            this.loadState = 'ready';
        } catch (error) {
            const message =
                axios.isAxiosError(error)
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : 'Unknown error';

            this.repositories = [];
            this.loadState = 'error';
            this.lastErrorMessage = message;

            this.outputChannel.appendLine(
                `Failed to load repositories: ${message}`
            );
        }
    }

    private getSectionChildren(
        section: SidebarSection
    ): SidebarNode[] {

        switch (section) {
        case 'overview':
            return [
                this.createBackendStatusNode(),
                {
                    kind: 'status',
                    label: `${this.repositories.length} repositories connected`,
                    description: 'Available for scanning',
                    tooltip:
                        'Repositories discovered from the backend service.',
                    icon: new vscode.ThemeIcon('repo')
                }
            ];
        case 'actions':
            return [
                {
                    kind: 'command',
                    label: 'Refresh Repositories',
                    description: 'Reload backend data',
                    tooltip:
                        'Refresh the repository list from the backend service.',
                    icon: new vscode.ThemeIcon('refresh'),
                    command: {
                        command: 'devsecops.refreshRepositories',
                        title: 'Refresh Repositories'
                    }
                }
            ];
        case 'repositories':
            if (this.loadState === 'error') {
                return [
                    {
                        kind: 'empty',
                        label: 'Backend unavailable',
                        description:
                            'Start the API on localhost:5000',
                        tooltip: this.lastErrorMessage
                    }
                ];
            }

            if (this.repositories.length === 0) {
                return [
                    {
                        kind: 'empty',
                        label: 'No repositories found',
                        description:
                            'Create or register repositories in the backend',
                        tooltip:
                            'The backend responded successfully, but no repositories were returned.'
                    }
                ];
            }

            return this.repositories.map(
                (repository) => ({
                    kind: 'repository',
                    repository
                })
            );
        }
    }

    private getRepositoryChildren(
        repository: RepositoryRecord
    ): SidebarNode[] {
        return [
            {
                kind: 'command',
                label: 'Run Security Scan',
                description: 'SAST and dependency checks',
                tooltip:
                    `Trigger a security scan for ${repository.name}.`,
                icon: new vscode.ThemeIcon('shield'),
                command: {
                    command: 'devsecops.runSecurityScan',
                    title: 'Run Security Scan',
                    arguments: [repository.id]
                }
            },
            {
                kind: 'command',
                label: 'Check Dependencies',
                description: 'Inspect package risks',
                tooltip:
                    `Run a dependency check for ${repository.name}.`,
                icon: new vscode.ThemeIcon('package'),
                command: {
                    command: 'devsecops.checkDependencies',
                    title: 'Check Dependencies',
                    arguments: [repository.id]
                }
            },
            {
                kind: 'repositoryInfo',
                label: 'Repository ID',
                description: repository.id,
                tooltip: `Backend identifier: ${repository.id}`,
                icon: new vscode.ThemeIcon('tag')
            }
        ];
    }

    private createSectionItem(
        element: SectionNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.Expanded
            );

        item.description = element.description;
        item.contextValue = `section:${element.section}`;

        item.iconPath =
            new vscode.ThemeIcon(
                this.getSectionIcon(element.section)
            );

        return item;
    }

    private createStatusItem(
        element: StatusNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.None
            );

        item.description = element.description;
        item.tooltip = element.tooltip;
        item.iconPath = element.icon;
        item.contextValue = 'status';

        return item;
    }

    private createCommandItem(
        element: CommandNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.None
            );

        item.description = element.description;
        item.tooltip = element.tooltip;
        item.iconPath = element.icon;
        item.command = element.command;
        item.contextValue = 'action';

        return item;
    }

    private createRepositoryItem(
        element: RepositoryNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.repository.name,
                vscode.TreeItemCollapsibleState.Collapsed
            );

        item.description = `ID ${element.repository.id}`;
        item.tooltip =
            new vscode.MarkdownString(
                `**${element.repository.name}**\n\nExpand to run scans and review repository details.`
            );

        item.iconPath =
            new vscode.ThemeIcon('repo');

        item.contextValue = 'repository';

        return item;
    }

    private createRepositoryInfoItem(
        element: RepositoryInfoNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.None
            );

        item.description = element.description;
        item.tooltip = element.tooltip;
        item.iconPath = element.icon;
        item.contextValue = 'repositoryInfo';

        return item;
    }

    private createEmptyItem(
        element: EmptyNode
    ): vscode.TreeItem {

        const item =
            new vscode.TreeItem(
                element.label,
                vscode.TreeItemCollapsibleState.None
            );

        item.description = element.description;
        item.tooltip = element.tooltip;
        item.iconPath =
            new vscode.ThemeIcon('info');

        item.contextValue = 'empty';

        return item;
    }

    private createBackendStatusNode(): StatusNode {
        if (this.loadState === 'error') {
            return {
                kind: 'status',
                label: 'Backend offline',
                description: 'Connection failed',
                tooltip: this.lastErrorMessage,
                icon: new vscode.ThemeIcon(
                    'error',
                    new vscode.ThemeColor('problemsErrorIcon.foreground')
                )
            };
        }

        return {
            kind: 'status',
            label: 'Backend connected',
            description: 'Ready to scan',
            tooltip:
                'Connected to the backend service on http://localhost:5000.',
            icon: new vscode.ThemeIcon(
                'pass-filled',
                new vscode.ThemeColor('testing.iconPassed')
            )
        };
    }

    private getOverviewDescription(): string {
        if (this.loadState === 'error') {
            return 'Waiting for backend';
        }

        return `${this.repositories.length} repos live`;
    }

    private getRepositoriesDescription(): string {
        if (this.loadState === 'error') {
            return 'Backend required';
        }

        return `${this.repositories.length} available`;
    }

    private getSectionIcon(
        section: SidebarSection
    ): string {
        switch (section) {
        case 'overview':
            return 'dashboard';
        case 'actions':
            return 'zap';
        case 'repositories':
            return 'repo';
        }
    }
}
