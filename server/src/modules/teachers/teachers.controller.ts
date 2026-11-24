import { Request, Response, NextFunction } from "express";
import { teachersService } from "./teachers.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryTeacherDto } from "./teachers.schema.js";

export class TeachersController {
  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await teachersService.getMetrics();
      ApiResponse.success(res, metrics, "Teacher metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryTeacherDto;
      const result = await teachersService.getAllTeachers(query);
      if (result.pagination) {
        ApiResponse.paginated(
          res,
          result.items,
          result.pagination,
          "Teachers retrieved successfully"
        );
      } else {
        ApiResponse.success(res, result.items, "Teachers retrieved successfully");
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const teacher = await teachersService.getTeacherById(id);
      ApiResponse.success(res, teacher, "Teacher retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await teachersService.createTeacher(req.body);
      ApiResponse.created(res, teacher, "Teacher created successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const teacher = await teachersService.updateTeacher(id, req.body);
      ApiResponse.success(res, teacher, "Teacher updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await teachersService.deleteTeacher(id);
      ApiResponse.success(res, null, "Teacher deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const teachersController = new TeachersController();
