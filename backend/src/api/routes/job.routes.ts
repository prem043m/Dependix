import { Router } from "express";
import { JobController } from "../controllers/job.controller";

const router = Router();

router.get("/", JobController.list);
router.get("/:jobId", JobController.getStatus);

export default router;
