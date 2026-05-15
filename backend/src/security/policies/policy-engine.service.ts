export class PolicyEngineService {
  static evaluate(scan: any) {
    if (scan.critical > 0) {
      return {
        allowed: false,
        reason: "Critical vulnerabilities detected",
      };
    }

    if (scan.high > 5) {
      return {
        allowed: false,
        reason: "Too many high vulnerabilities",
      };
    }

    return {
      allowed: true,
      reason: "Policy checks passed",
    };
  }
}