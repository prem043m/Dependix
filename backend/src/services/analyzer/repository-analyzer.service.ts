export class RepositoryAnalyzerService {
  static analyze(files: string[]) {
    return {
      hasPackageJson: files.some((f) => f.endsWith("package.json")),

      hasRequirements: files.some((f) => f.endsWith("requirements.txt")),

      hasPom: files.some((f) => f.endsWith("pom.xml")),

      hasGoMod: files.some((f) => f.endsWith("go.mod")),

      hasDocker: files.some((f) => f.endsWith("Dockerfile")),

      hasDockerCompose: files.some((f) =>
        f.endsWith("docker-compose.yml") || f.endsWith("docker-compose.yaml")
      ),

      hasGitHubActions: files.some((f) => f.includes(".github/workflows")),
    };
  }
}
