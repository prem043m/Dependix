import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import {
  buildWorkflow,
  type PipelineGenerationInput,
} from "../../generators/workflow-builder";
import { YAMLGenerator } from "../../generators/yaml-generator";
import { GitHubService } from "../github/github.service";

type RepositoryPipelineInput = PipelineGenerationInput & {
  repositoryId: string;
};

type PipelineDbClient = Prisma.TransactionClient | typeof prisma;

export class PipelineGeneratorService {
  static async createForRepository(
    input: RepositoryPipelineInput,
    db: PipelineDbClient = prisma
  ) {
    const workflow = buildWorkflow(input);
    const yamlContent = YAMLGenerator.generate(workflow);

    const client = db as any; // Still need a bit of flexibility because of how Prisma types TransactionClient vs Client sometimes, but let's make it cleaner
    
    return client.pipeline.create({
      data: {
        repositoryId: input.repositoryId,
        name: workflow.name,
        yamlContent,
      },
    });
  }

  static async generateFromRepositoryId(repositoryId: string) {
    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
      include: {
        analysis: true,
      },
    });

    if (!repository?.analysis) {
      throw new Error("Repository or analysis not found for pipeline generation");
    }

    const pipeline = await this.createForRepository({
      repositoryId: repository.id,
      language: repository.analysis.language,
      framework: repository.analysis.framework,
      packageManager: repository.analysis.packageManager,
      hasDocker: repository.analysis.hasDocker,
      defaultBranch: repository.defaultBranch,
    });

    await GitHubService.createWorkflowFile(
      repository.owner,
      repository.name,
      pipeline.yamlContent
    );

    return pipeline;
  }

  static async getLatestByRepositoryId(repositoryId: string) {
    return (prisma as any).pipeline.findFirst({
      where: {
        repositoryId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
