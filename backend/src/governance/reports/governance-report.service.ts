export class GovernanceReportService {
  static generate(
    risk: any,
    policy: any
  ) {
    return {
      timestamp: new Date(),

      riskLevel: risk.riskLevel,

      securityScore: risk.score,

      autoMerge: policy.autoMerge,

      blocked: policy.blocked,

      reason: policy.reason,
    };
  }
}