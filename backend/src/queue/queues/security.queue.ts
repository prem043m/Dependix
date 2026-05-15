import { Queue } from "bullmq";
import { redisConnection } from "../redis";

export const securityQueue = new Queue("security-scans", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
