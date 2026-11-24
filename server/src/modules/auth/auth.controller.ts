import { Request, Response, NextFunction } from "express";
import { authService, parseExpiryMs } from "./auth.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { usersService } from "../users/users.service.js";
import { env } from "../../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  const isProduction = env.NODE_ENV === "production";
  const sameSite = (env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none";
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction || sameSite === "none",
    sameSite,
    path: "/api/auth",
    maxAge: parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

function clearRefreshCookie(res: Response): void {
  const isProduction = env.NODE_ENV === "production";
  const sameSite = (env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none";
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction || sameSite === "none",
    sameSite,
    path: "/api/auth",
  });
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      setRefreshCookie(res, result.tokens.refreshToken);

      ApiResponse.success(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        "Logged in successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      setRefreshCookie(res, result.tokens.refreshToken);

      ApiResponse.created(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        "Account registered successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token =
        (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) ||
        req.body?.refreshToken;

      if (!token) {
        ApiResponse.error(res, "Refresh token is missing", 401);
        return;
      }

      const tokens = await authService.refresh(token);
      setRefreshCookie(res, tokens.refreshToken);

      ApiResponse.success(
        res,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token =
        (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) ||
        req.body?.refreshToken;

      await authService.logout(token, req.user?.userId);
      clearRefreshCookie(res);

      ApiResponse.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, "Not authenticated", 401);
        return;
      }
      const user = await usersService.getUserById(req.user.userId);
      ApiResponse.success(res, user, "Current user profile");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
