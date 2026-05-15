import { Router } from "express";
import { RepositoryController } from "../controllers/repository.controller";

const router = Router();

router.post("/", RepositoryController.register);
router.get("/", RepositoryController.list);
router.get("/:id", RepositoryController.get);

export default router;