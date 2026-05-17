import dotenv from "dotenv";
import "./queue/schedulers/scan.scheduler";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { startSecurityEventsBridge } from "./realtime/security-events.bridge";
import { initializeSocketServer } from "./realtime/socket.server";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

initializeSocketServer(server);
startSecurityEventsBridge();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
