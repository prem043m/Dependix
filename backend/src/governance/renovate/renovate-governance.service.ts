import {
  DependencyRiskService
} from '../risk/dependencyRisk.service';
import {
  SecurityCorrelationService
} from '../../security/security-correlation.service';

import {
  RenovateParserService
} from './renovate-parser.service';

type RenovatePullRequest = {
    title?: string;
    html_url?: string;
    number?: number;
    head?: {
        ref?: string;
    };
};

export class RenovateGovernanceService {

    static async evaluatePR(
        pr: RenovatePullRequest
    ) {
        const title =
            pr.title ?? '';

        const branchName =
            pr.head?.ref ?? '';

        if (
            branchName === 'renovate/configure' ||
            /configure renovate/i.test(title)
        ) {

            return {
                dependency:
                    'Renovate onboarding',

                newVersion:
                    'configuration',

                risk: {
                    risk: 'MANUAL_REVIEW',
                    recommendation:
                        'Manual review required',
                    reason:
                        'Renovate onboarding PR'
                },
                security: null,
                recommendation:
                    'Manual review required',
                prTitle: title,
                prUrl: pr.html_url ?? null,
                pullNumber: pr.number ?? null
            };
        }

        const parsed =
            RenovateParserService.parsePRTitle(
                title
            );

        if (!parsed) {

            return null;
        }

        // demo current version
        const currentVersion =
            '18.0.0';

        const risk =
            DependencyRiskService.evaluate(
                currentVersion,
                parsed.version
            );

        const security =
            await SecurityCorrelationService.checkPackage(
                parsed.dependency,
                parsed.version
            );

        const recommendation =
            security?.critical
                ? 'Block merge'
                : risk.recommendation;

        return {
            dependency:
                parsed.dependency,

            newVersion:
                parsed.version,

            risk,
            security,
            recommendation,
            prTitle: title,
            prUrl: pr.html_url ?? null,
            pullNumber: pr.number ?? null
        };
    }
}
