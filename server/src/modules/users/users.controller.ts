import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";

export class UsersController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.getAllUsers();
      ApiResponse.success(res, users, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await usersService.getUserById(id);
      ApiResponse.success(res, user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.createUser(req.body);
      ApiResponse.created(res, user, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await usersService.updateUser(id, req.body);
      ApiResponse.success(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await usersService.deleteUser(id);
      ApiResponse.success(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
