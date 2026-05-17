import { Router } from "express";
import { RepositoryController } from "../controllers/repository.controller";

const router = Router();

router.get("/", async (_req, res) => {
  return res.json({
    repositories: [
      {
        id: "1",
        name: "expressjs/express"
      },
      {
        id: "2",
        name: "nestjs/nest"
      },
      {
        id: "3",
        name: "devsecops-platform"
      }
    ]
  });
});

router.post("/", RepositoryController.register);
router.get("/:id", RepositoryController.get);

export default router;
