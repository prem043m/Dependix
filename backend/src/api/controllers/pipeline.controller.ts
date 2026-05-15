import { Request, Response } from "express";

import { PipelineGeneratorService } from "../../services/pipeline/pipeline-generator.service";

export class PipelineController {
  static async generate(req: Request, res: Response) {
    try {
      const repositoryId = req.params.repositoryId;

      if (typeof repositoryId !== "string" || repositoryId.trim() === "") {
        return res.status(400).json({
          message: "repositoryId is required",
        });
      }

      const pipeline = await PipelineGeneratorService.generateFromRepositoryId(
        repositoryId
      );

      return res.status(201).json({
        message: "Pipeline generated",
        pipeline,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async getLatest(req: Request, res: Response) {
    try {
      const repositoryId = req.params.repositoryId;

      if (typeof repositoryId !== "string" || repositoryId.trim() === "") {
        return res.status(400).json({
          message: "repositoryId is required",
        });
      }

      const pipeline =
        await PipelineGeneratorService.getLatestByRepositoryId(
          repositoryId
        );

      if (!pipeline) {
        return res.status(404).json({
          message: "Pipeline not found",
        });
      }

      return res.status(200).json({
        pipeline,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}
