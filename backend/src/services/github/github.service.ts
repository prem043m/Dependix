import { Octokit } from "@octokit/rest";

const githubToken = process.env.GITHUB_TOKEN?.trim();
const hasUsableToken =
  githubToken &&
  githubToken.length > 0 &&
  githubToken !== "your_github_token_here";

const octokit = new Octokit(
  hasUsableToken
    ? { auth: githubToken }
    : {}
);

export class GitHubService {
  static async getRepository(owner: string, repo: string) {
    const response = await octokit.repos.get({
      owner,
      repo,
    });

    return response.data;
  }

  static async getRepositoryContents(
    owner: string,
    repo: string
  ) {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: "",
    });

    return response.data;
  }

  static async getFileContent(
    owner: string,
    repo: string,
    path: string
  ) {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    return response.data;
  }

  static async getRepositoryTree(owner: string, repo: string) {
    try {
      const repoData = await this.getRepository(owner, repo);
      const defaultBranch = repoData.default_branch;

      const tree = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
      });

      return tree.data.tree;
    } catch (error: any) {
      console.error(`Error fetching tree for ${owner}/${repo}:`, error.message);
      // Fallback: return empty array or throw descriptive error
      throw new Error(`Failed to fetch repository structure: ${error.message}`);
    }
  }

  /**
   * SAFETY: Manual workflow file commit (NEVER called automatically)
   * 
   * ⚠️ CRITICAL GOVERNANCE RULE ⚠️
   * This method is provided for MANUAL operations only.
   * DO NOT CALL THIS AUTOMATICALLY during repository registration or pipeline generation.
   * 
   * Dependix is a CI/CD Governance Overlay System, NOT a workflow replacement system.
   * 
   * Automatic workflow commits violate the governance philosophy:
   * - Existing workflows are respected and analyzed
   * - New workflow recommendations remain in Dependix for manual review
   * - Users must explicitly choose to implement recommendations
   * 
   * This method should ONLY be invoked by explicit user action (e.g., manual approval in UI).
   */
  static async createWorkflowFile(
    owner: string,
    repo: string,
    content: string
  ) {
    const encoded = Buffer.from(content).toString("base64");
    let sha: string | undefined;

    try {
      const existingFile = await this.getFileContent(
        owner,
        repo,
        ".github/workflows/generated-ci.yml"
      );

      if (!Array.isArray(existingFile) && "sha" in existingFile) {
        sha = existingFile.sha;
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        throw error;
      }
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: ".github/workflows/generated-ci.yml",
      message: "Add generated CI pipeline",
      content: encoded,
      ...(sha ? { sha } : {}),
    });
  }
}
