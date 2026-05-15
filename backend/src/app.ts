import express from "express";
import cors from "cors";

import pipelineRoutes from "./api/routes/pipeline.router";
import repositoryRoutes from "./api/routes/repository.router";
import securityRoutes from "./api/routes/security.routes";
import governanceRoutes from "./api/routes/governance.routes";
import jobRoutes from "./api/routes/job.routes";

const app = express();

app.disable("x-powered-by");

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
  credentials: true
}));

app.use(express.json());

app.use("/security", securityRoutes);
app.use("/repositories", repositoryRoutes);
app.use("/pipelines", pipelineRoutes);
app.use("/governance", governanceRoutes);
app.use("/jobs", jobRoutes);

export default app;
