import { Worker } from "bullmq";
import { redisConnection } from "../redis";
import { SecurityOrchestratorService } from "../../security/orchestrator/security-orchestrator.service";

const worker = new Worker(
  "security-scans",
  async (job) => {
    const { repositoryId } = job.data;
    console.log(`Running scan for repository: ${repositoryId}`);
    return await SecurityOrchestratorService.run(repositoryId);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed`, error);
});
