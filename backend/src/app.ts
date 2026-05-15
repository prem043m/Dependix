import express from "express";
import cors from "cors";

import pipelineRoutes from "./api/routes/pipeline.router";
import repositoryRoutes from "./api/routes/repository.router";
import securityRoutes from "./api/routes/security.routes";
import governanceRoutes from "./api/routes/governance.routes";

const app = express();

app.disable("x-powered-by");

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.use("/security", securityRoutes);
app.use("/repositories", repositoryRoutes);
app.use("/pipelines", pipelineRoutes);
app.use("/governance", governanceRoutes);

export default app;
