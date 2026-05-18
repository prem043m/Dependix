import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { SnykScanner } from "../scanners/snyk.scanner";
import { TrivyScanner } from "../scanners/trivy.scanner";
import { GitleaksScanner } from "../scanners/gitleaks.scanner";
import { SecurityReportParser } from "../parsers/security-report.parser";
import { PolicyEngineService } from "../policies/policy-engine.service";
import { GovernanceOrchestratorService } from "../../governance/governance-orchestrator.service";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import simpleGit from "simple-git";

export class SecurityOrchestratorService {
  static async run(repositoryId: string) {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    const cloneDir = path.join(os.tmpdir(), "devsecops", repository.name + "-" + Date.now());
    fs.mkdirSync(cloneDir, { recursive: true });

    try {
      await simpleGit().clone(repository.url, cloneDir);

      const scans = [];

      // 1. Snyk Scan
      let snykRaw: any = {};
      try {
        snykRaw = await SnykScanner.scan(cloneDir);
        const snykParsed = SecurityReportParser.parseSnyk(snykRaw);
        const policy = PolicyEngineService.evaluate(snykParsed);
        scans.push({
          tool: "Snyk",
          status: policy.allowed ? "PASSED" : "FAILED",
          critical: snykParsed.critical,
          high: snykParsed.high,
          medium: snykParsed.medium,
          low: snykParsed.low,
          rawReport: snykRaw as Prisma.InputJsonValue,
        });
      } catch (e) {
        console.error("Snyk scan failed:", e);
      }

      // 2. Trivy Scan
      try {
        const trivyRaw = await TrivyScanner.scan(cloneDir);
        const trivyParsed = SecurityReportParser.parseTrivy(trivyRaw);
        const policy = PolicyEngineService.evaluate(trivyParsed);
        scans.push({
          tool: "Trivy",
          status: policy.allowed ? "PASSED" : "FAILED",
          critical: trivyParsed.critical, high: trivyParsed.high,
          medium: trivyParsed.medium, low: trivyParsed.low,
          rawReport: trivyRaw as Prisma.InputJsonValue,
        });
      } catch (e) {
        console.error("Trivy scan failed:", e);
      }

      // 3. Gitleaks Scan
      try {
        const gitleaksRaw = await GitleaksScanner.scan(cloneDir);
        const gitleaksParsed = SecurityReportParser.parseGitleaks(gitleaksRaw);
        const policy = PolicyEngineService.evaluate(gitleaksParsed);
        scans.push({
          tool: "Gitleaks",
          status: policy.allowed ? "PASSED" : "FAILED",
          critical: gitleaksParsed.critical, high: 0, medium: 0, low: 0,
          rawReport: gitleaksRaw as Prisma.InputJsonValue,
        });
      } catch (e) {
        console.error("Gitleaks scan failed:", e);
      }

      const savedScans = await prisma.$transaction(
        scans.map((scan) =>
          prisma.securityScan.create({
            data: {
              ...scan,
              repositoryId,
            },
          })
        )
      );

      // Evaluate governance decision after scans complete
      let governanceDecision = null;
      try {
        const governanceResult = await GovernanceOrchestratorService.evaluate(repositoryId);
        governanceDecision = governanceResult.decision;
      } catch (e) {
        console.error("Governance evaluation failed:", e);
      }

      return {
        scans: savedScans,
        overallStatus: savedScans.every((s) => s.status === "PASSED") ? "PASSED" : "FAILED",
        governanceDecision,
      };
    } finally {
      if (fs.existsSync(cloneDir)) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      }
    }
  }
}
