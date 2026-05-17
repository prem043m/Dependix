import * as vscode from 'vscode';
import type {
    GovernanceDecisionRecord,
    SecurityScanRecord
} from '../models/platform';

export function getRiskBadge(
    risk: string
): string {
    switch (risk.toUpperCase()) {
    case 'LOW':
        return 'LOW';
    case 'MEDIUM':
        return 'MEDIUM';
    case 'HIGH':
    case 'MANUAL_REVIEW':
        return 'HIGH';
    default:
        return 'UNKNOWN';
    }
}

export function getRiskIcon(
    risk: string
): vscode.ThemeIcon {
    switch (risk.toUpperCase()) {
    case 'LOW':
        return new vscode.ThemeIcon(
            'pass-filled',
            new vscode.ThemeColor('testing.iconPassed')
        );
    case 'MEDIUM':
        return new vscode.ThemeIcon(
            'warning',
            new vscode.ThemeColor('problemsWarningIcon.foreground')
        );
    case 'HIGH':
    case 'MANUAL_REVIEW':
        return new vscode.ThemeIcon(
            'error',
            new vscode.ThemeColor('problemsErrorIcon.foreground')
        );
    default:
        return new vscode.ThemeIcon('question');
    }
}

export function getScanStatusIcon(
    status: string
): vscode.ThemeIcon {
    switch (status.toUpperCase()) {
    case 'PASSED':
        return new vscode.ThemeIcon(
            'shield',
            new vscode.ThemeColor('testing.iconPassed')
        );
    case 'FAILED':
        return new vscode.ThemeIcon(
            'shield',
            new vscode.ThemeColor('problemsErrorIcon.foreground')
        );
    default:
        return new vscode.ThemeIcon('shield');
    }
}

export function getGovernanceIcon(
    decision: GovernanceDecisionRecord
): vscode.ThemeIcon {
    if (decision.blocked) {
        return new vscode.ThemeIcon(
            'error',
            new vscode.ThemeColor('problemsErrorIcon.foreground')
        );
    }

    return getRiskIcon(decision.riskLevel);
}

export function getSeveritySummary(
    scan: SecurityScanRecord
): string {
    return [
        `${scan.critical} critical`,
        `${scan.high} high`,
        `${scan.medium} medium`,
        `${scan.low} low`
    ].join(' | ');
}
