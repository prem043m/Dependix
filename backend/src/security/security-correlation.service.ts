import axios from 'axios';

type OsvSeverity = {
    score?: string;
};

type OsvVulnerability = {
    id?: string;
    aliases?: string[];
    summary?: string;
    severity?: OsvSeverity[];
};

type OsvResponse = {
    vulns?: OsvVulnerability[];
};

export type SecurityCorrelationResult = {
    vulnerabilities: number;
    critical: boolean;
    advisories: Array<{
        id: string;
        summary: string;
        aliases: string[];
        severity: string[];
    }>;
};

export class SecurityCorrelationService {

    static async checkPackage(
        packageName: string,
        version: string
    ): Promise<SecurityCorrelationResult | null> {

        try {

            const response =
                await axios.post<OsvResponse>(
                    'https://api.osv.dev/v1/query',
                    {
                        package: {
                            name: packageName,
                            ecosystem: 'npm'
                        },
                        version
                    },
                    {
                        timeout: 10000
                    }
                );

            const vulnerabilities =
                Array.isArray(response.data?.vulns)
                    ? response.data.vulns
                    : [];

            const advisories =
                vulnerabilities.map((vulnerability) => ({
                    id:
                        vulnerability.id ??
                        vulnerability.aliases?.[0] ??
                        'UNKNOWN',
                    summary:
                        vulnerability.summary ??
                        'No summary available',
                    aliases:
                        vulnerability.aliases ?? [],
                    severity:
                        (vulnerability.severity ?? [])
                            .map((entry) => entry.score)
                            .filter(
                                (score): score is string =>
                                    typeof score === 'string'
                            )
                }));

            const critical =
                advisories.some((advisory) =>
                    advisory.severity.some(
                        (score) =>
                            /critical/i.test(score) ||
                            this.getCvssBaseScore(score) >= 9
                    )
                );

            return {
                vulnerabilities: advisories.length,
                critical,
                advisories
            };
        } catch (error) {

            console.error(
                'OSV security correlation failed:',
                error
            );

            return null;
        }
    }

    private static getCvssBaseScore(
        score: string
    ): number {
        const match =
            score.match(/CVSS:[0-9.]+\/.+?\/([0-9]+(?:\.[0-9]+)?)$/i);

        if (match?.[1]) {
            return Number(match[1]);
        }

        const numericMatch =
            score.match(/([0-9]+(?:\.[0-9]+)?)/);

        return numericMatch?.[1]
            ? Number(numericMatch[1])
            : 0;
    }
}
