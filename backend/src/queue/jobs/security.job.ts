import { securityQueue } from "../queues/security.queue";

export class SecurityJob {
  static async add(repositoryId: string) {
    return await securityQueue.add(
      "run-security-scan",
      {
        repositoryId,
      }
    );
  }
}
