import { spawn } from "child_process";

export class TrivyScanner {
  static scan(repoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn("trivy", ["fs", "--format", "json", "."], { cwd: repoPath, shell: true });

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
          return reject(new Error("Trivy CLI not found. Please install it."));
        }
        reject(error);
      });

      child.on("close", (code) => {
        if (stdoutData) {
          try {
            return resolve(JSON.parse(stdoutData));
          } catch (parseError) {
            console.error("Failed to parse Trivy output:", parseError);
          }
        }

        if (code !== 0 && !stdoutData) {
          return reject(new Error(`Trivy process exited with code ${code}: ${stderrData}`));
        }

        resolve({});
      });
    });
  }
}