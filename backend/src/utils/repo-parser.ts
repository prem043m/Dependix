export function parseGitHubRepo(url: string) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);

  const owner = match?.[1];
  const repo = match?.[2];

  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner,
    repo: repo.replace(".git", ""),
  };
}
