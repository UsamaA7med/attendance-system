import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { errorHandler } from "./core/middleware/error-handler.js";
import { notFoundHandler } from "./core/middleware/not-found.js";
import { ApiResponse } from "./core/utils/api-response.js";

// Feature module routers
import { authRouter } from "./modules/auth/index.js";
import { usersRouter } from "./modules/users/index.js";
import { teachersRouter } from "./modules/teachers/index.js";
import { attendanceRouter } from "./modules/attendance/index.js";
import { reportsRouter } from "./modules/reports/index.js";

export function createApp(): Express {
  const app = express();

  // Core Security & Utility Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Health check endpoint
  app.get("/health", (_req, res) => {
    ApiResponse.success(
      res,
      {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      "Attendance System API is running smoothly"
    );
  });

  app.get("/api", (_req, res) => {
    ApiResponse.success(
      res,
      {
        name: "Attendance System Modular Monolith API",
        version: "1.0.0",
        features: ["auth", "users", "teachers", "attendance", "reports"],
      },
      "Welcome to the Attendance System API"
    );
  });

  // Feature Modules Mount Points
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/teachers", teachersRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/reports", reportsRouter);

  // Fallback 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
