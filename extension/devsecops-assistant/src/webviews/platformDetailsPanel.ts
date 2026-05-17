import * as vscode from 'vscode';
import type {
    PipelineRecord,
    RenovateEvaluation,
    RepositoryDetail
} from '../models/platform';
import { getSeveritySummary } from '../utils/badges';
import {
    escapeHtml,
    formatDateTime
} from '../utils/formatting';

export class PlatformDetailsPanel {
    static showRepositoryDetails(
        repository: RepositoryDetail,
        pipeline: PipelineRecord | null
    ): void {
        const panel =
            vscode.window.createWebviewPanel(
                'devsecopsRepositoryDetails',
                `${repository.owner}/${repository.name}`,
                vscode.ViewColumn.Active,
                {
                    enableFindWidget: true
                }
            );

        panel.webview.html =
            this.renderRepositoryHtml(
                repository,
                pipeline
            );
    }

    static showDependencyDetails(
        evaluation: RenovateEvaluation
    ): void {
        const panel =
            vscode.window.createWebviewPanel(
                'devsecopsDependencyDetails',
                `${evaluation.dependency} governance`,
                vscode.ViewColumn.Active,
                {
                    enableFindWidget: true
                }
            );

        panel.webview.html =
            this.renderDependencyHtml(
                evaluation
            );
    }

    private static renderRepositoryHtml(
        repository: RepositoryDetail,
        pipeline: PipelineRecord | null
    ): string {
        const analysis =
            repository.analysis;

        const scanCards =
            repository.securityScans.length > 0
                ? repository.securityScans.map(
                    (scan) => `
                        <section class="card">
                            <h3>${escapeHtml(scan.tool)} <span class="muted">${escapeHtml(scan.status)}</span></h3>
                            <p>${escapeHtml(getSeveritySummary(scan))}</p>
                            <p class="muted">${escapeHtml(formatDateTime(scan.createdAt))}</p>
                        </section>
                    `
                ).join('')
                : '<p class="muted">No security scans recorded.</p>';

        const governanceCards =
            repository.governanceDecisions.length > 0
                ? repository.governanceDecisions.map(
                    (decision) => `
                        <section class="card">
                            <h3>${escapeHtml(decision.riskLevel)}</h3>
                            <p>${escapeHtml(decision.reason)}</p>
                            <p class="muted">Blocked: ${decision.blocked ? 'Yes' : 'No'} | Auto merge: ${decision.autoMerge ? 'Yes' : 'No'}</p>
                            <p class="muted">${escapeHtml(formatDateTime(decision.createdAt))}</p>
                        </section>
                    `
                ).join('')
                : '<p class="muted">No governance decisions recorded.</p>';

        const pipelineBlock =
            pipeline
                ? `
                    <section class="card wide">
                        <h2>Generated Workflow</h2>
                        <p class="muted">${escapeHtml(pipeline.name)} | ${escapeHtml(formatDateTime(pipeline.createdAt))}</p>
                        <pre>${escapeHtml(pipeline.yamlContent)}</pre>
                    </section>
                `
                : `
                    <section class="card wide">
                        <h2>Generated Workflow</h2>
                        <p class="muted">No stored workflow has been generated for this repository yet.</p>
                    </section>
                `;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: var(--vscode-font-family); padding: 24px; color: var(--vscode-foreground); }
                    h1, h2, h3 { font-weight: 600; }
                    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                    .card { border: 1px solid var(--vscode-panel-border); border-radius: 10px; padding: 16px; background: var(--vscode-editor-background); }
                    .wide { margin-top: 16px; }
                    .muted { color: var(--vscode-descriptionForeground); }
                    a { color: var(--vscode-textLink-foreground); }
                    pre { white-space: pre-wrap; overflow-x: auto; border-radius: 8px; padding: 16px; background: var(--vscode-textCodeBlock-background); }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(repository.owner)}/${escapeHtml(repository.name)}</h1>
                <p><a href="${escapeHtml(repository.url)}">${escapeHtml(repository.url)}</a></p>
                <div class="grid">
                    <section class="card">
                        <h2>Repository</h2>
                        <p>Branch: ${escapeHtml(repository.defaultBranch)}</p>
                        <p>Visibility: ${escapeHtml(repository.visibility)}</p>
                        <p class="muted">Registered ${escapeHtml(formatDateTime(repository.createdAt))}</p>
                    </section>
                    <section class="card">
                        <h2>Analysis</h2>
                        <p>Language: ${escapeHtml(analysis?.language ?? 'Unknown')}</p>
                        <p>Framework: ${escapeHtml(analysis?.framework ?? 'Not detected')}</p>
                        <p>Package manager: ${escapeHtml(analysis?.packageManager ?? 'Not detected')}</p>
                        <p>Docker: ${analysis?.hasDocker ? 'Yes' : 'No'} | CI: ${analysis?.hasCI ? 'Yes' : 'No'}</p>
                    </section>
                </div>
                <h2>Security Scans</h2>
                <div class="grid">${scanCards}</div>
                <h2>Governance Decisions</h2>
                <div class="grid">${governanceCards}</div>
                ${pipelineBlock}
            </body>
            </html>
        `;
    }

    private static renderDependencyHtml(
        evaluation: RenovateEvaluation
    ): string {
        const advisories =
            evaluation.security?.advisories.length
                ? evaluation.security.advisories.map(
                    (advisory) => `
                        <section class="card">
                            <h3>${escapeHtml(advisory.id)}</h3>
                            <p>${escapeHtml(advisory.summary)}</p>
                            <p class="muted">${escapeHtml(advisory.aliases.join(', ') || 'No aliases')}</p>
                            <p class="muted">${escapeHtml(advisory.severity.join(', ') || 'No severity metadata')}</p>
                        </section>
                    `
                ).join('')
                : '<p class="muted">No OSV advisories were returned for this dependency version.</p>';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: var(--vscode-font-family); padding: 24px; color: var(--vscode-foreground); }
                    h1, h2, h3 { font-weight: 600; }
                    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                    .card { border: 1px solid var(--vscode-panel-border); border-radius: 10px; padding: 16px; background: var(--vscode-editor-background); }
                    .muted { color: var(--vscode-descriptionForeground); }
                    a { color: var(--vscode-textLink-foreground); }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(evaluation.dependency)} -> ${escapeHtml(evaluation.newVersion)}</h1>
                <p>${escapeHtml(evaluation.repository.owner)}/${escapeHtml(evaluation.repository.name)}</p>
                <div class="grid">
                    <section class="card">
                        <h2>Governance</h2>
                        <p>Risk: ${escapeHtml(evaluation.risk.risk)}</p>
                        <p>Recommendation: ${escapeHtml(evaluation.recommendation ?? evaluation.risk.recommendation)}</p>
                        <p class="muted">${escapeHtml(evaluation.risk.reason ?? 'No rationale recorded')}</p>
                    </section>
                    <section class="card">
                        <h2>Security Correlation</h2>
                        <p>Vulnerabilities: ${evaluation.security?.vulnerabilities ?? 0}</p>
                        <p>Critical present: ${evaluation.security?.critical ? 'Yes' : 'No'}</p>
                        <p class="muted">OSV-backed advisory enrichment</p>
                    </section>
                    <section class="card">
                        <h2>Pull Request</h2>
                        <p>${escapeHtml(evaluation.prTitle ?? 'No title available')}</p>
                        <p><a href="${escapeHtml(evaluation.prUrl ?? evaluation.repository.url)}">${escapeHtml(evaluation.prUrl ?? evaluation.repository.url)}</a></p>
                    </section>
                </div>
                <h2>Advisories</h2>
                <div class="grid">${advisories}</div>
            </body>
            </html>
        `;
    }
}
