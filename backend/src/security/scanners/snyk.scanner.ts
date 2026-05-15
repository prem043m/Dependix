import { spawn } from "child_process";

export class SnykScanner {
  static scan(repoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // snyk test returns non-zero exit codes when vulnerabilities are found.
      const child = spawn("snyk", ["test", "--json"], { cwd: repoPath, shell: true });

      let stdoutData = "";
      let stderrData = "";

      child.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      child.on("error", (error) => {
        if ((error as any).code === 'ENOENT') {
          return reject(new Error("Snyk CLI not found. Please install it with 'npm install -g snyk'."));
        }
        reject(error);
      });

      child.on("close", (code) => {
        if (stdoutData) {
          try {
            return resolve(JSON.parse(stdoutData));
          } catch (parseError) {
            console.error("Failed to parse Snyk output:", parseError);
          }
        }

        if (code !== 0 && !stdoutData) {
          return reject(new Error(`Snyk process exited with code ${code}: ${stderrData}`));
        }

        resolve({});
      });
    });
  }
}