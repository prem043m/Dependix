import cron from "node-cron";
import { prisma } from "../../database/prisma";
import { SecurityJob } from "../jobs/security.job";

// Run scheduled scans every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Running scheduled scans for all repositories");

  try {
    const repositories = await prisma.repository.findMany();

    for (const repo of repositories) {
      console.log(`Queuing scheduled scan for: ${repo.name}`);
      await SecurityJob.add(repo.id);
    }
  } catch (error) {
    console.error("Error running scheduled scans:", error);
  }
});
