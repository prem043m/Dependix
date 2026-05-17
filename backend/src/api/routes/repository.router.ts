import { Router } from "express";
import { RepositoryController } from "../controllers/repository.controller";

const router = Router();

router.get("/", RepositoryController.list);
router.post("/", RepositoryController.register);
router.get("/:id", RepositoryController.get);

export default router;
