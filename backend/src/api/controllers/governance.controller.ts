import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { GovernanceOrchestratorService } from "../../governance/governance-orchestrator.service";

export class GovernanceController {
  static async getComplianceSummary(req: Request, res: Response) {
    try {
      const totalRepos = await prisma.repository.count();
      const scans = await prisma.securityScan.findMany({
        orderBy: { createdAt: "desc" },
      });

      // Get latest scan for each repository to determine compliance
      const latestScansMap = new Map();
      scans.forEach((scan) => {
        const key = `${scan.repositoryId}-${scan.tool}`;
        if (!latestScansMap.has(key)) {
          latestScansMap.set(key, scan);
        }
      });

      const latestScans = Array.from(latestScansMap.values());
      const nonCompliantRepos = new Set(
        latestScans.filter((s) => s.status === "FAILED").map((s) => s.repositoryId)
      );

      return res.status(200).json({
        summary: {
          totalRepositories: totalRepos,
          compliantRepositories: totalRepos - nonCompliantRepos.size,
          nonCompliantRepositories: nonCompliantRepos.size,
          complianceRate: totalRepos > 0 
            ? `${(((totalRepos - nonCompliantRepos.size) / totalRepos) * 100).toFixed(2)}%` 
            : "100%",
        },
        latestScans: latestScans.slice(0, 10), // Return last 10 scan results for context
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async getRepositoryGovernance(req: Request, res: Response) {
    try {
      const { repositoryId } = req.params;

      if (typeof repositoryId !== "string") {
        return res.status(400).json({ message: "Invalid repositoryId" });
      }

      const repository = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: {
          analysis: true,
          securityScans: {
            orderBy: { createdAt: "desc" },
          },
          governanceDecisions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }

      return res.status(200).json(repository);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async evaluate(req: Request, res: Response) {
    try {
      const { repositoryId } = req.params;
      const { pullNumber } = req.body;

      if (typeof repositoryId !== "string" || repositoryId.trim() === "") {
        return res.status(400).json({
          message: "repositoryId is required",
        });
      }

      const result = await GovernanceOrchestratorService.evaluate(
        repositoryId,
        pullNumber ? Number(pullNumber) : undefined
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}
