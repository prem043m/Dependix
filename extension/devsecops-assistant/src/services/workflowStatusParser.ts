import type {
    CheckRunRecord,
    WorkflowRunRecord,
    CICDHealthRecord
} from '../models/platform';

const SECURITY_GATE_PATTERN =
    /codeql|snyk|trivy|dependency review|secret|security|osv|semgrep|grype/i;

export class WorkflowStatusParser {
    parseWorkflowRuns(
        runs: Array<{
            id: number;
            name?: string | null;
            display_title?: string | null;
            head_branch?: string | null;
            event: string;
            status: string | null;
            conclusion: string | null;
            html_url?: string | null;
            created_at: string;
            updated_at: string;
        }>
    ): WorkflowRunRecord[] {
        return runs.map(
            (run) => ({
                id: run.id,
                name: run.display_title ?? run.name ?? 'Workflow run',
                workflowName: run.name ?? 'Unnamed workflow',
                branch: run.head_branch ?? 'unknown',
                event: run.event,
                status: run.status ?? 'unknown',
                conclusion: run.conclusion,
                htmlUrl: run.html_url ?? null,
                createdAt: run.created_at,
                updatedAt: run.updated_at
            })
        );
    }

    parseCheckRuns(
        runs: Array<{
            id: number;
            name: string;
            status: string;
            conclusion: string | null;
            details_url?: string | null;
            started_at?: string | null;
            completed_at?: string | null;
        }>
    ): CheckRunRecord[] {
        return runs.map(
            (run) => ({
                id: run.id,
                name: run.name,
                status: run.status,
                conclusion: run.conclusion,
                detailsUrl: run.details_url ?? null,
                startedAt: run.started_at ?? null,
                completedAt: run.completed_at ?? null,
                isSecurityGate: SECURITY_GATE_PATTERN.test(run.name)
            })
        );
    }

    buildHealthRecord(
        workflowRuns: WorkflowRunRecord[],
        checkRuns: CheckRunRecord[]
    ): CICDHealthRecord {
        const failingRuns =
            workflowRuns.filter(
                (run) => run.conclusion === 'failure'
            ).length;

        const failedSecurityGates =
            checkRuns.filter(
                (run) => run.isSecurityGate && run.conclusion === 'failure'
            ).length;

        if (
            workflowRuns.length === 0 &&
            checkRuns.length === 0
        ) {
            return {
                overall: 'unknown',
                summary: 'No workflow runs or check runs were available from GitHub.',
                failingRuns,
                failedSecurityGates
            };
        }

        if (
            failedSecurityGates > 0 ||
            failingRuns > 0
        ) {
            return {
                overall: failedSecurityGates > 0 ? 'critical' : 'warning',
                summary: failedSecurityGates > 0
                    ? 'Security gates are failing in the existing CI/CD pipeline.'
                    : 'Existing CI/CD is present, but some workflow runs are failing.',
                failingRuns,
                failedSecurityGates
            };
        }

        return {
            overall: 'healthy',
            summary: 'Existing CI/CD workflows and checks look healthy.',
            failingRuns,
            failedSecurityGates
        };
    }
}
