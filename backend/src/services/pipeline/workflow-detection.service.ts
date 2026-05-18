import { GitHubService } from "../github/github.service";

export type WorkflowDetectionResult = {
  hasExistingWorkflow: boolean;
  workflowType: "github-actions" | "gitlab-ci" | "jenkins" | "azure" | null;
  workflowPaths: string[];
};

export class WorkflowDetectionService {
  /**
   * Detect existing CI/CD workflows in a repository
   * Checks for: GitHub Actions, GitLab CI, Jenkinsfile, Azure Pipelines
   */
  static async detectExistingWorkflows(
    owner: string,
    repo: string
  ): Promise<WorkflowDetectionResult> {
    try {
      const tree = await GitHubService.getRepositoryTree(owner, repo);
      const files = tree.map((item: any) => item.path);

      const workflowPaths: string[] = [];
      let workflowType: "github-actions" | "gitlab-ci" | "jenkins" | "azure" | null = null;

      // Check for GitHub Actions workflows
      const githubWorkflows = files.filter((f: string) =>
        f.includes(".github/workflows") &&
        (f.endsWith(".yml") || f.endsWith(".yaml"))
      );

      if (githubWorkflows.length > 0) {
        workflowPaths.push(...githubWorkflows);
        workflowType = "github-actions";
      }

      // Check for GitLab CI
      if (files.includes(".gitlab-ci.yml")) {
        workflowPaths.push(".gitlab-ci.yml");
        if (!workflowType) workflowType = "gitlab-ci";
      }

      // Check for Jenkinsfile
      if (files.includes("Jenkinsfile")) {
        workflowPaths.push("Jenkinsfile");
        if (!workflowType) workflowType = "jenkins";
      }

      // Check for Azure Pipelines
      if (files.includes("azure-pipelines.yml") || files.includes("azure-pipelines.yaml")) {
        workflowPaths.push(
          ...files.filter(
            (f: string) =>
              f === "azure-pipelines.yml" || f === "azure-pipelines.yaml"
          )
        );
        if (!workflowType) workflowType = "azure";
      }

      return {
        hasExistingWorkflow: workflowPaths.length > 0,
        workflowType,
        workflowPaths,
      };
    } catch (error) {
      console.error("Error detecting workflows:", error);
      // If we can't detect, assume no workflows exist (safe default)
      return {
        hasExistingWorkflow: false,
        workflowType: null,
        workflowPaths: [],
      };
    }
  }
}
