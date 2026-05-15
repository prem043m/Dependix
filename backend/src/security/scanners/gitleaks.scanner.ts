import { spawn } from "child_process";

export class GitleaksScanner {
  static scan(repoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // gitleaks returns exit code 1 if leaks are found
      const child = spawn("gitleaks", ["detect", "--source", ".", "--report-format", "json", "--report-path", "leaks.json"], { cwd: repoPath, shell: true });

      let stderrData = "";

      child.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      child.on("error", (error) => {
        if ((error as any).code === 'ENOENT') {
          return reject(new Error("Gitleaks CLI not found. Please install it."));
        }
        reject(error);
      });

      child.on("close", (code) => {
        // Gitleaks often writes to leaks.json instead of stdout.
        // For the purposes of this orchestrator, we resolve empty for now
        // or we could add logic to read leaks.json if it exists.
        resolve([]);
      });
    });
  }
}