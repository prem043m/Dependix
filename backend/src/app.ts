import express from "express";
import cors from "cors";

import pipelineRoutes from "./api/routes/pipeline.router";
import repositoryRoutes from "./api/routes/repository.router";
import securityRoutes from "./api/routes/security.routes";
import governanceRoutes from "./api/routes/governance.routes";
import jobRoutes from "./api/routes/job.routes";
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
  const repositoryId = req.params.repositoryId;

  console.log("Running Renovate:", repositoryId);

  emitRealtimeEvent("dependency-check-started", {
    repositoryId,
    status: "RUNNING",
  });

  setTimeout(() => {
    emitRealtimeEvent("dependency-check-completed", {
      repositoryId,
      status: "SIMULATED",
      message: "Renovate scan started",
    });
  }, 150);

  return res.json({
    success: true,
    message: "Renovate scan started",
  });
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
    const owner =
      typeof req.query.owner === "string"
        ? req.query.owner
        : process.env.GITHUB_RENOVATE_OWNER;

    const repo =
      typeof req.query.repo === "string"
        ? req.query.repo
        : process.env.GITHUB_RENOVATE_REPO;

    if (!owner || !repo) {
      return res.status(400).json({
        message:
          "Configure GITHUB_RENOVATE_OWNER and GITHUB_RENOVATE_REPO, or pass owner and repo query parameters.",
      });
    }

    const prs = await GithubPRService.getRenovatePRs(owner, repo);
    const evaluations = (
      await Promise.all(
        prs.map((pr) => RenovateGovernanceService.evaluatePR(pr))
      )
    ).filter((evaluation) => evaluation !== null);

    return res.json({
      owner,
      repo,
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
