import { prisma } from "../database/prisma";

import { RiskEvaluatorService } from "./risk/risk-evaluator.service";

import { PolicyEngineService } from "./policies/policy-engine.service";

import { GovernanceReportService } from "./reports/governance-report.service";

export class GovernanceOrchestratorService {
  static async evaluate(
    repositoryId: string
  ) {
    const latestScan =
      await prisma.securityScan.findFirst({
        where: {
          repositoryId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!latestScan) {
      throw new Error(
        "No security scan found"
      );
    }

    const risk =
      RiskEvaluatorService.evaluate(
        latestScan
      );

    const policy =
      PolicyEngineService.evaluate(
        risk
      );

    const report =
      GovernanceReportService.generate(
        risk,
        policy
      );

    const decision =
      await prisma.governanceDecision.create({
        data: {
          repositoryId,

          riskLevel: risk.riskLevel,

          autoMerge: policy.autoMerge,

          blocked: policy.blocked,

          reason: policy.reason,
        },
      });

    return {
      report,
      decision,
    };
  }
}