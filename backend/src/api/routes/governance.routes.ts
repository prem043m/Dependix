import { Router } from "express";
import { GovernanceController } from "../controllers/governance.controller";

const router = Router();

router.get("/summary", GovernanceController.getComplianceSummary);
router.get("/repository/:repositoryId", GovernanceController.getRepositoryGovernance);

export default router;
