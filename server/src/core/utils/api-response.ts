import { Response } from "express";

export interface ApiResponseFormat<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data?: T,
    message = "Success",
    statusCode = 200
  ): Response {
    const payload: ApiResponseFormat<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    data?: T,
    message = "Resource created successfully"
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = "Internal Server Error",
    statusCode = 500,
    errors?: unknown
  ): Response {
    const payload: ApiResponseFormat = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
