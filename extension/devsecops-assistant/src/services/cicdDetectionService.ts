import type {
    CICDDetectionRecord,
    CICDProvider
} from '../models/platform';
import { GitHubGovernanceClient } from './githubGovernanceClient';

const PROVIDER_PATHS: Array<{
    provider: CICDProvider;
    path: string;
    name: string;
}> = [
    {
        provider: 'jenkins',
        path: 'Jenkinsfile',
        name: 'Jenkins'
    },
    {
        provider: 'gitlab-ci',
        path: '.gitlab-ci.yml',
        name: 'GitLab CI'
    },
    {
        provider: 'circleci',
        path: '.circleci/config.yml',
        name: 'CircleCI'
    },
    {
        provider: 'azure-pipelines',
        path: 'azure-pipelines.yml',
        name: 'Azure Pipelines'
    },
    {
        provider: 'azure-pipelines',
        path: '.azure-pipelines/azure-pipelines.yml',
        name: 'Azure Pipelines'
    }
];

export class CICDDetectionService {
    constructor(
        private readonly githubClient: GitHubGovernanceClient
    ) {}

    async detectExistingCICD(
        repositoryUrl: string
    ): Promise<CICDDetectionRecord[]> {
        const detections: CICDDetectionRecord[] = [];
        const workflows =
            await this.githubClient.listActionsWorkflows(
                repositoryUrl
            );

        for (const workflow of workflows) {
            detections.push({
                provider: workflow.name.match(/codeql|snyk|trivy|dependency review|secret/i)
                    ? 'security-workflow'
                    : 'github-actions',
                name: workflow.name,
                path: workflow.path,
                detectedVia: 'github-api',
                isSecurityWorkflow: /codeql|snyk|trivy|dependency review|secret/i.test(workflow.name)
            });
        }

        const fileDetections =
            await this.githubClient.detectRepositoryFiles(
                repositoryUrl,
                PROVIDER_PATHS.map(
                    ({ path }) => path
                )
            );

        for (const fileDetection of fileDetections) {
            if (!fileDetection.exists) {
                continue;
            }

            const matchedProvider =
                PROVIDER_PATHS.find(
                    ({ path }) => path === fileDetection.path
                );

            if (!matchedProvider) {
                continue;
            }

            detections.push({
                provider: matchedProvider.provider,
                name: matchedProvider.name,
                path: matchedProvider.path,
                detectedVia: 'repository-file',
                isSecurityWorkflow: false
            });
        }

        return dedupeDetections(detections);
    }
}

function dedupeDetections(
    detections: CICDDetectionRecord[]
): CICDDetectionRecord[] {
    const seen =
        new Set<string>();

    return detections.filter(
        (detection) => {
            const key =
                `${detection.provider}:${detection.path}:${detection.name}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        }
    );
}
