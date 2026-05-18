import type {
    CICDGovernanceOverlay,
    CheckRunRecord,
    GovernanceRecommendation,
    RepositoryDetail,
    StarterWorkflowRecommendation
} from '../models/platform';

export class GovernanceCorrelationEngine {
    correlate(
        repository: RepositoryDetail,
        overlay: Omit<
            CICDGovernanceOverlay,
            'recommendations' | 'starterWorkflowRecommendation'
        >
    ): Pick<
        CICDGovernanceOverlay,
        'recommendations' | 'starterWorkflowRecommendation'
    > {
        const recommendations: GovernanceRecommendation[] = [];
        let starterWorkflowRecommendation: StarterWorkflowRecommendation | null =
            null;

        if (!overlay.hasExistingCICD) {
            starterWorkflowRecommendation = {
                title: 'Optional starter workflow',
                rationale: 'No CI/CD workflows were detected. Recommend a minimal starter workflow only through a pull request for developer review.',
                deliveryModel: 'pull-request-recommendation-only',
                yamlContent: [
                    'name: starter-devsecops',
                    '',
                    'on:',
                    '  pull_request:',
                    '  workflow_dispatch:',
                    '',
                    'jobs:',
                    '  verify:',
                    '    runs-on: ubuntu-latest',
                    '    steps:',
                    '      - uses: actions/checkout@v4',
                    '      - uses: actions/setup-node@v4',
                    '        with:',
                    '          node-version: 20',
                    '      - run: npm ci',
                    '      - run: npm test',
                    '      - run: npm audit --audit-level=high',
                    '        continue-on-error: true'
                ].join('\n')
            };

            recommendations.push({
                title: 'Keep workflow creation optional',
                description: 'Offer the starter workflow as a pull request recommendation only. Do not push or overwrite CI/CD directly.',
                priority: 'high'
            });
        }

        const failedSecurityGates =
            overlay.failedSecurityGates;

        if (failedSecurityGates.length > 0) {
            recommendations.push({
                title: 'Investigate failed security gates',
                description: summarizeCheckNames(
                    failedSecurityGates,
                    'One or more security gates failed in the existing pipeline'
                ),
                priority: 'high'
            });
        }

        const latestGovernance =
            repository.latestGovernance;

        if (latestGovernance?.blocked) {
            recommendations.push({
                title: 'Align repository governance with CI/CD outcomes',
                description: `The latest governance decision is blocking changes: ${latestGovernance.reason}`,
                priority: 'high'
            });
        }

        const latestScan =
            repository.latestScan;

        if (
            latestScan &&
            latestScan.critical > 0 &&
            failedSecurityGates.length === 0
        ) {
            recommendations.push({
                title: 'Add or tighten security gates in existing CI/CD',
                description: `Latest scan shows ${latestScan.critical} critical findings, but no failed security gate was observed from GitHub checks.`,
                priority: 'medium'
            });
        }

        if (
            overlay.hasExistingCICD &&
            overlay.checkRuns.length === 0 &&
            overlay.workflowRuns.length === 0
        ) {
            recommendations.push({
                title: 'Review GitHub visibility for CI/CD signals',
                description: 'CI/CD files were detected, but no workflow runs or checks were available. Verify GitHub permissions, provider configuration, or whether the pipeline runs outside GitHub.',
                priority: 'medium'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                title: 'Continue monitoring existing CI/CD',
                description: 'Existing automation looks stable. Keep using this extension as a governance overlay for health, gates, and risk correlation.',
                priority: 'low'
            });
        }

        return {
            recommendations,
            starterWorkflowRecommendation
        };
    }
}

function summarizeCheckNames(
    checks: CheckRunRecord[],
    fallback: string
): string {
    if (checks.length === 0) {
        return fallback;
    }

    return `${fallback}: ${checks
        .map((check) => check.name)
        .join(', ')}`;
}
