import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`
  =======================================================
  🚀 VANTA ERP API Server Started Successfully
  =======================================================
  📡 Environment : ${env.NODE_ENV}
  🔌 Port        : ${env.PORT}
  🔗 Base URL    : http://localhost:${env.PORT}/api
  📄 Swagger Docs: http://localhost:${env.PORT}/api/docs
  ❤️ Health Check: http://localhost:${env.PORT}/api/health
  =======================================================
  `);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
