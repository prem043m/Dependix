import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export class AutoMergeService {
  static async mergePullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ) {
    return await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: "squash",
    });
  }
}