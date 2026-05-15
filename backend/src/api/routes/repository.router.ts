import { Router } from "express";

import { RepositoryController } from "../controllers/repository.controller";

const router = Router();

router.post("/", RepositoryController.register);

export default router;