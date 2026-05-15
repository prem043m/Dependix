import { Router } from "express";

import { PipelineController } from "../controllers/pipeline.controller";

const router = Router();

router.post("/:repositoryId/generate", PipelineController.generate);
router.get("/:repositoryId/latest", PipelineController.getLatest);

export default router;
