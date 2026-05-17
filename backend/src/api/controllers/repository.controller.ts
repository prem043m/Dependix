import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { parseGitHubRepo } from "../../utils/repo-parser";
import { GitHubService } from "../../services/github/github.service";
import { RepositoryAnalyzerService } from "../../services/analyzer/repository-analyzer.service";
import { StackDetectorService } from "../../services/detector/stack-detector.service";
import { PipelineGeneratorService } from "../../services/pipeline/pipeline-generator.service";
import { emitRealtimeEvent } from "../../realtime/socket.server";

export class RepositoryController {
  static async register(req: Request, res: Response) {
    try {
      const repoUrl = req.body?.repoUrl;

      if (typeof repoUrl !== "string" || repoUrl.trim() === "") {
        return res.status(400).json({
          message: "repoUrl is required",
        });
      }

      const { owner, repo } = parseGitHubRepo(repoUrl);

      const repository = await GitHubService.getRepository(owner, repo);
      const tree = await GitHubService.getRepositoryTree(owner, repo);
      const files = tree.map((item: any) => item.path);

      const analysis = RepositoryAnalyzerService.analyze(files);
      const detection = StackDetectorService.detect(analysis);

      const result = await prisma.$transaction(async (tx) => {
        const savedRepo = await tx.repository.upsert({
          where: { url: repository.html_url },
          update: {
            name: repository.name,
            owner: repository.owner.login,
            defaultBranch: repository.default_branch,
            visibility: repository.visibility ?? "public",
          },
          create: {
            name: repository.name,
            owner: repository.owner.login,
            url: repository.html_url,
            defaultBranch: repository.default_branch,
            visibility: repository.visibility ?? "public",
          },
        });

        const savedAnalysis = await tx.analysis.upsert({
          where: { repositoryId: savedRepo.id },
          update: {
            language: detection.language,
            framework: detection.framework,
            packageManager: detection.packageManager,
            hasDocker: detection.hasDocker,
            hasCI: detection.hasCI,
          },
          create: {
            repositoryId: savedRepo.id,
            language: detection.language,
            framework: detection.framework,
            packageManager: detection.packageManager,
            hasDocker: detection.hasDocker,
            hasCI: detection.hasCI,
          },
        });

        const pipeline = await PipelineGeneratorService.createForRepository(
          {
            repositoryId: savedRepo.id,
            language: detection.language,
            framework: detection.framework,
            packageManager: detection.packageManager,
            hasDocker: detection.hasDocker,
            defaultBranch: repository.default_branch,
          },
          tx
        );

        return {
          repository: savedRepo,
          analysis: savedAnalysis,
          pipeline,
        };
      });

      emitRealtimeEvent("repository-registered", {
        repositoryId: result.repository.id,
        repositoryName: `${result.repository.owner}/${result.repository.name}`,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      if (error?.status === 401) {
        return res.status(401).json({
          message: "GitHub authentication failed. Set a valid GITHUB_TOKEN.",
        });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repositories = await prisma.repository.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          analysis: true,
          securityScans: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          governanceDecisions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          pipelines: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      return res.status(200).json({
        repositories: repositories.map(
          ({
            securityScans,
            governanceDecisions,
            pipelines,
            ...repository
          }) => ({
            ...repository,
            latestScan: securityScans[0] ?? null,
            latestGovernance: governanceDecisions[0] ?? null,
            latestPipeline: pipelines[0] ?? null,
          })
        ),
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ message: "Invalid repository id" });
      }

      const repository = await prisma.repository.findUnique({
        where: { id },
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

      return res.status(200).json({
        repository: {
          ...repository,
          latestScan: repository.securityScans[0] || null,
          latestGovernance: repository.governanceDecisions[0] || null,
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
