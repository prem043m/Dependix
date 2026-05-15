export class RiskEvaluatorService {
  static evaluate(scan: any) {
    const {
      critical,
      high,
      medium,
      low,
    } = scan;

    let score = 100;

    score -= critical * 25;
    score -= high * 10;
    score -= medium * 5;
    score -= low * 1;

    if (score < 0) {
      score = 0;
    }

    let riskLevel = "LOW";

    if (critical > 0 || score < 40) {
      riskLevel = "CRITICAL";
    } else if (high > 5 || score < 60) {
      riskLevel = "HIGH";
    } else if (medium > 10 || score < 80) {
      riskLevel = "MEDIUM";
    }

    return {
      score,
      riskLevel,
    };
  }
}