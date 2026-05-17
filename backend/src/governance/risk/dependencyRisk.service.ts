import semver from 'semver';

export class DependencyRiskService {

    static evaluate(
        currentVersion: string,
        newVersion: string
    ) {

        const current =
            semver.coerce(currentVersion);

        const latest =
            semver.coerce(newVersion);

        if (!current || !latest) {

            return {
                risk: 'UNKNOWN',

                recommendation:
                    'Manual review required'
            };
        }

        if (
            latest.major > current.major
        ) {

            return {
                risk: 'HIGH',

                recommendation:
                    'Manual review required',

                reason:
                    'Major version update'
            };
        }

        if (
            latest.minor > current.minor
        ) {

            return {
                risk: 'MEDIUM',

                recommendation:
                    'Run tests before merge',

                reason:
                    'Minor version update'
            };
        }

        return {
            risk: 'LOW',

            recommendation:
                'Safe to merge',

            reason:
                'Patch update'
        };
    }
}