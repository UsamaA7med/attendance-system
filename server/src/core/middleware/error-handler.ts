import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";
import { env } from "../../config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    ApiResponse.error(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Prisma unique constraint violations (P2002) cleanly
  if ((err as { code?: string }).code === "P2002") {
    const meta = (err as { meta?: { modelName?: string } }).meta;
    const model = meta?.modelName ? `${meta.modelName} ` : "";
    ApiResponse.error(
      res,
      `${model}already exists or unique constraint was violated`,
      409
    );
    return;
  }

  logger.error("Unhandled Exception:", err);

  const isDbConfigError = err.message?.includes("DATABASE_URL");
  const message = isDbConfigError
    ? "Database connection configuration missing. Please verify DATABASE_URL in Vercel environment variables."
    : env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message;

  ApiResponse.error(
    res,
    message,
    500,
    env.NODE_ENV === "development" ? err.stack : undefined
  );
}
