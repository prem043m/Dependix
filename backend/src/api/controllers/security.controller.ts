import { Request, Response } from "express";

import { SecurityJob } from "../../queue/jobs/security.job";

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

      const job = await SecurityJob.add(repositoryId);

      return res.status(202).json({
        message: "Security scan queued",
        jobId: job.id,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}