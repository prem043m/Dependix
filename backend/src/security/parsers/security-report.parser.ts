export class SecurityReportParser {
  static parseSnyk(report: any) {
    const vulnerabilities =
      report.vulnerabilities || [];

    return {
      critical: vulnerabilities.filter(
        (v: any) => v.severity === "critical"
      ).length,

      high: vulnerabilities.filter(
        (v: any) => v.severity === "high"
      ).length,

      medium: vulnerabilities.filter(
        (v: any) => v.severity === "medium"
      ).length,

      low: vulnerabilities.filter(
        (v: any) => v.severity === "low"
      ).length,
    };
  }

  static parseTrivy(report: any) {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    report.Results?.forEach((result: any) => {
      result.Vulnerabilities?.forEach((v: any) => {
        if (v.Severity === "CRITICAL") critical++;
        if (v.Severity === "HIGH") high++;
        if (v.Severity === "MEDIUM") medium++;
        if (v.Severity === "LOW") low++;
      });
    });

    return {
      critical,
      high,
      medium,
      low,
    };
  }

  static parseGitleaks(report: any) {
    const findings = Array.isArray(report) ? report : [];

    return {
      critical: findings.length, // Secrets are usually treated as critical
      high: 0,
      medium: 0,
      low: 0,
    };
  }
}