export class PolicyEngineService {
  static evaluate(risk: any) {
    const { riskLevel } = risk;

    if (riskLevel === "CRITICAL") {
      return {
        autoMerge: false,
        blocked: true,
        reason:
          "Critical vulnerabilities detected",
      };
    }

    if (riskLevel === "HIGH") {
      return {
        autoMerge: false,
        blocked: true,
        reason:
          "High risk repository changes",
      };
    }

    if (riskLevel === "MEDIUM") {
      return {
        autoMerge: false,
        blocked: false,
        reason:
          "Manual approval required",
      };
    }

    return {
      autoMerge: true,
      blocked: false,
      reason:
        "Safe for automatic merge",
    };
  }
}