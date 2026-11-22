import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./core/utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  logger.info(`📚 Base API available at: http://localhost:${env.PORT}/api`);
  logger.info(`🩺 Health check available at: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown handling
function gracefulShutdown(signal: string) {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("Closed out remaining connections. Server stopped safely.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds timeout
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection detected:", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception thrown:", error);
  process.exit(1);
});
