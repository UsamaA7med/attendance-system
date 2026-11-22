import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { usersService } from "../users/users.service.js";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      ApiResponse.success(res, result, "Logged in successfully");
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      ApiResponse.created(res, result, "Account registered successfully");
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
