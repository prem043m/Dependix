import { Router } from "express";

import { SecurityController } from "../controllers/security.controller";

const router = Router();

router.post(
  "/:repositoryId/run",
  SecurityController.run
);

export default router;