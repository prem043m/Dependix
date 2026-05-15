import { Request, Response } from "express";

import { SecurityOrchestratorService } from "../../security/orchestrator/security-orchestrator.service";

export class SecurityController {
  static async run(
    req: Request,
    res: Response
  ) {
    try {
      const { repositoryId } = req.params;

      if (typeof repositoryId !== "string" || repositoryId.trim() === "") {
        return res.status(400).json({
          message: "repositoryId is required",
        });
      }

      const result =
        await SecurityOrchestratorService.run(
          repositoryId
        );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}