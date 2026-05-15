export class StackDetectorService {
  static detect(analysis: any) {
    let language = null;
    let packageManager = null;
    let framework = null;

    // Prioritization: Check for specific indicators
    if (analysis.hasPackageJson) {
      language = "Node.js";
      packageManager = "npm";
    } else if (analysis.hasRequirements) {
      language = "Python";
      packageManager = "pip";
    } else if (analysis.hasGoMod) {
      language = "Go";
      packageManager = "go";
    } else if (analysis.hasPom) {
      language = "Java";
      packageManager = "maven";
    }

    return {
      language,
      packageManager,
      framework,
      hasDocker: analysis.hasDocker || analysis.hasDockerCompose,
      hasCI: analysis.hasGitHubActions,
    };
  }
}