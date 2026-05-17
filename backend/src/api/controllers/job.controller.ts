import { Request, Response } from "express";
import { securityQueue } from "../../queue/queues/security.queue";

export class JobController {
  static async getStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      if (typeof jobId !== "string") {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      const job = await securityQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      return res.status(200).json({
        id: job.id,
        state,
        progress,
        result,
        failedReason,
        repositoryId:
          typeof job.data?.repositoryId === "string"
            ? job.data.repositoryId
            : null,
        timestamp: job.timestamp,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const jobs = await securityQueue.getJobs([
        "active",
        "waiting",
        "completed",
        "failed",
        "delayed",
      ], 0, 50, false);

      const formatted = await Promise.all(
        jobs.map(async (job) => ({
          id: job.id,
          state: await job.getState(),
          progress: job.progress,
          repositoryId:
            typeof job.data?.repositoryId === "string"
              ? job.data.repositoryId
              : null,
          timestamp: job.timestamp,
        }))
      );

      return res.status(200).json({ jobs: formatted });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}
