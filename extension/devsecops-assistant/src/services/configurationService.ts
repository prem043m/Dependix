import * as vscode from 'vscode';

export class ConfigurationService {
    static getBackendUrl(): string {
        const configuredUrl =
            vscode.workspace
                .getConfiguration('devsecops')
                .get<string>(
                    'backendUrl',
                    'http://localhost:5000'
                );

        return configuredUrl.replace(/\/$/, '');
    }
}
