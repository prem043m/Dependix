import * as vscode from 'vscode';
import type { OutputChannel } from 'vscode';
import { getErrorMessage } from '../../utils/errors';

type LoadState =
    | 'idle'
    | 'loading'
    | 'ready'
    | 'error';

export abstract class AsyncTreeProvider
implements vscode.TreeDataProvider<vscode.TreeItem> {

    protected readonly onDidChangeTreeDataEmitter =
        new vscode.EventEmitter<vscode.TreeItem | undefined>();

    readonly onDidChangeTreeData =
        this.onDidChangeTreeDataEmitter.event;

    private state: LoadState = 'idle';
    private errorMessage?: string;
    private rootItems: vscode.TreeItem[] = [];

    constructor(
        protected readonly outputChannel: OutputChannel
    ) {}

    refresh(): void {
        this.state = 'idle';
        this.errorMessage = undefined;
        this.rootItems = [];
        this.onDidChangeTreeDataEmitter.fire(undefined);
    }

    getTreeItem(
        element: vscode.TreeItem
    ): vscode.TreeItem {
        return element;
    }

    async getChildren(
        element?: vscode.TreeItem
    ): Promise<vscode.TreeItem[]> {
        if (element) {
            return this.getNestedChildren(element);
        }

        if (this.state === 'idle') {
            this.state = 'loading';
            void this.loadRootItems();

            return [
                this.createInfoItem(
                    'Loading data...',
                    'Fetching live platform state from the backend.'
                )
            ];
        }

        if (this.state === 'loading') {
            return [
                this.createInfoItem(
                    'Loading data...',
                    'Fetching live platform state from the backend.'
                )
            ];
        }

        if (this.state === 'error') {
            return [
                this.createInfoItem(
                    'Backend unavailable',
                    this.errorMessage
                )
            ];
        }

        if (this.rootItems.length === 0) {
            return [
                this.createInfoItem(
                    this.getEmptyLabel(),
                    this.getEmptyDescription()
                )
            ];
        }

        return this.rootItems;
    }

    protected async getNestedChildren(
        _element: vscode.TreeItem
    ): Promise<vscode.TreeItem[]> {
        return [];
    }

    protected createInfoItem(
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
        item.contextValue = 'info';

        return item;
    }

    protected abstract buildRootItems():
    Promise<vscode.TreeItem[]>;

    protected abstract getEmptyLabel(): string;

    protected abstract getEmptyDescription():
    string | undefined;

    private async loadRootItems(): Promise<void> {
        try {
            this.rootItems =
                await this.buildRootItems();
            this.state = 'ready';
        } catch (error) {
            this.state = 'error';
            this.errorMessage =
                getErrorMessage(error);

            this.outputChannel.appendLine(
                `Tree provider load failed: ${this.errorMessage}`
            );
        } finally {
            this.onDidChangeTreeDataEmitter.fire(undefined);
        }
    }
}
