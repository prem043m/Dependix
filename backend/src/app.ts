import express from "express";
import cors from "cors";

import pipelineRoutes from "./api/routes/pipeline.router";
import repositoryRoutes from "./api/routes/repository.router";
import securityRoutes from "./api/routes/security.routes";
import governanceRoutes from "./api/routes/governance.routes";
import jobRoutes from "./api/routes/job.routes";
import { prisma } from "./database/prisma";
import { DependencyRiskService } from "./governance/risk/dependencyRisk.service";
import { GithubPRService } from "./github/github-pr.service";
import { RenovateGovernanceService } from "./governance/renovate/renovate-governance.service";
import { emitRealtimeEvent } from "./realtime/socket.server";

const app = express();

app.disable("x-powered-by");

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
  credentials: true
}));

app.use(express.json());

app.post("/dependencies/:repositoryId/check", async (req, res) => {
  try {
    const repositoryId = req.params.repositoryId;

    if (typeof repositoryId !== "string" || repositoryId.trim() === "") {
      return res.status(400).json({
        message: "repositoryId is required",
      });
    }

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
    });

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    emitRealtimeEvent("dependency-check-started", {
      repositoryId,
      status: "RUNNING",
      repositoryName: `${repository.owner}/${repository.name}`,
    });

    const prs = await GithubPRService.getRenovatePRs(
      repository.owner,
      repository.name
    );

    const evaluations = (
      await Promise.all(
        prs.map((pr) => RenovateGovernanceService.evaluatePR(pr))
      )
    ).filter((evaluation) => evaluation !== null);

    emitRealtimeEvent("dependency-check-completed", {
      repositoryId,
      status: "COMPLETED",
      repositoryName: `${repository.owner}/${repository.name}`,
      evaluationsCount: evaluations.length,
      highRiskCount: evaluations.filter(
        (evaluation) =>
          evaluation.risk.risk === "HIGH" ||
          evaluation.risk.risk === "MANUAL_REVIEW" ||
          evaluation.security?.critical
      ).length,
    });

    return res.json({
      success: true,
      message: "Dependency governance refreshed",
      repositoryId,
      evaluations,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/dependencies/evaluate", async (req, res) => {
  const result = DependencyRiskService.evaluate("18.0.0", "19.0.0");

  emitRealtimeEvent("dependency-risk-evaluated", {
    risk: result.risk,
    recommendation: result.recommendation,
    reason: result.reason ?? null,
  });

  return res.json(result);
});

app.get("/governance/renovate", async (req, res) => {
  try {
    const repositoryId =
      typeof req.query.repositoryId === "string"
        ? req.query.repositoryId
        : undefined;

    const requestedOwner =
      typeof req.query.owner === "string"
        ? req.query.owner
        : process.env.GITHUB_RENOVATE_OWNER;

    const requestedRepo =
      typeof req.query.repo === "string"
        ? req.query.repo
        : process.env.GITHUB_RENOVATE_REPO;

    let repositories: Array<{
      id: string;
      owner: string;
      name: string;
      url: string;
    }> = [];

    if (repositoryId) {
      const repository = await prisma.repository.findUnique({
        where: {
          id: repositoryId,
        },
      });

      if (!repository) {
        return res.status(404).json({
          message: "Repository not found",
        });
      }

      repositories = [repository];
    } else if (requestedOwner && requestedRepo) {
      repositories = [
        {
          id: `${requestedOwner}/${requestedRepo}`,
          owner: requestedOwner,
          name: requestedRepo,
          url: `https://github.com/${requestedOwner}/${requestedRepo}`,
        },
      ];
    } else {
      repositories = await prisma.repository.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    const evaluations = (
      await Promise.all(
        repositories.map(async (repository) => {
          const prs = await GithubPRService.getRenovatePRs(
            repository.owner,
            repository.name
          );

          const repositoryEvaluations = (
            await Promise.all(
              prs.map((pr) => RenovateGovernanceService.evaluatePR(pr))
            )
          )
            .filter((evaluation) => evaluation !== null)
            .map((evaluation) => ({
              ...evaluation,
              repository: {
                id: repository.id,
                owner: repository.owner,
                name: repository.name,
                url: repository.url,
              },
            }));

          return repositoryEvaluations;
        })
      )
    ).flat();

    return res.json({
      repositories: repositories.map((repository) => ({
        id: repository.id,
        owner: repository.owner,
        name: repository.name,
        url: repository.url,
      })),
      evaluations,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.use("/security", securityRoutes);
app.use("/repositories", repositoryRoutes);
app.use("/pipelines", pipelineRoutes);
app.use("/governance", governanceRoutes);
app.use("/jobs", jobRoutes);

export default app;
