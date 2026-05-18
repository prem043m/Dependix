import { QueueEvents } from "bullmq";
import { securityQueue } from "../queue/queues/security.queue";
import { redisConnection } from "../queue/redis";
import { emitRealtimeEvent } from "./socket.server";

let bridgeStarted = false;

async function getJobSnapshot(jobId: string) {
  const job = await securityQueue.getJob(jobId);
  const repositoryId =
    typeof job?.data?.repositoryId === "string"
      ? job.data.repositoryId
      : null;

  const returnvalue =
    (job?.returnvalue as
      | {
          overallStatus?: string;
          governanceDecision?: {
            riskLevel?: string;
            autoMerge?: boolean;
            blocked?: boolean;
            reason?: string;
          };
        }
      | undefined) ?? undefined;

  return {
    repositoryId,
    returnvalue,
  };
}

export function startSecurityEventsBridge() {
  if (bridgeStarted) {
    return;
  }

  bridgeStarted = true;

  const queueEvents = new QueueEvents("security-scans", {
    connection: redisConnection,
  });

  queueEvents.on("waiting", async ({ jobId }) => {
    const snapshot = await getJobSnapshot(jobId);

    emitRealtimeEvent("scan-queued", {
      jobId,
      repositoryId: snapshot.repositoryId,
      status: "QUEUED",
    });
  });

  queueEvents.on("active", async ({ jobId }) => {
    const snapshot = await getJobSnapshot(jobId);

    emitRealtimeEvent("scan-started", {
      jobId,
      repositoryId: snapshot.repositoryId,
      status: "RUNNING",
    });
  });

  queueEvents.on("completed", async ({ jobId }) => {
    const snapshot = await getJobSnapshot(jobId);

    emitRealtimeEvent("scan-completed", {
      jobId,
      repositoryId: snapshot.repositoryId,
      status: snapshot.returnvalue?.overallStatus ?? "COMPLETED",
      governanceDecision: snapshot.returnvalue?.governanceDecision ?? null,
    });
  });

  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    const snapshot = await getJobSnapshot(jobId);

    emitRealtimeEvent("scan-failed", {
      jobId,
      repositoryId: snapshot.repositoryId,
      status: "FAILED",
      error: failedReason,
    });
  });

  queueEvents.on("error", (error) => {
    console.error("Security queue events bridge failed:", error);
  });
}
