import { prisma } from "../database/prisma";
import { RiskEvaluatorService } from "./risk/risk-evaluator.service";
import { PolicyEngineService } from "./policies/policy-engine.service";
import { GovernanceReportService } from "./reports/governance-report.service";
import { AutoMergeService } from "./merge/auto-merge.service";

export class GovernanceOrchestratorService {
  static async evaluate(
    repositoryId: string,
    pullNumber?: number
  ) {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    const latestScan = await prisma.securityScan.findFirst({
      where: { repositoryId },
      orderBy: { createdAt: "desc" },
    });

    if (!latestScan) {
      throw new Error("No security scan found");
    }

    const risk = RiskEvaluatorService.evaluate(latestScan);
    const policy = PolicyEngineService.evaluate(risk);
    const report = GovernanceReportService.generate(risk, policy);

    const decision = await prisma.governanceDecision.create({
      data: {
        repositoryId,
        riskLevel: risk.riskLevel,
        autoMerge: policy.autoMerge,
        blocked: policy.blocked,
        reason: policy.reason,
      },
    });

    // Automatically merge if policy allows and pull number is provided
    if (policy.autoMerge && pullNumber) {
      try {
        await AutoMergeService.mergePullRequest(
          repository.owner,
          repository.name,
          pullNumber
        );
      } catch (error: any) {
        console.error("Auto-merge failed:", error.message);
      }
    }

    return {
      report,
      decision,
    };
  }
}