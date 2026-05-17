import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export function initializeSocketServer(server: HttpServer) {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.emit("backend-status", {
      status: "connected",
      timestamp: new Date().toISOString(),
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitRealtimeEvent(
  event: string,
  payload: unknown
) {
  io?.emit(event, payload);
}
