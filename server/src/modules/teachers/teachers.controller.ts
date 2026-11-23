import { Request, Response, NextFunction } from "express";
import { teachersService } from "./teachers.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryTeacherDto } from "./teachers.schema.js";

export class TeachersController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryTeacherDto;
      const teachers = await teachersService.getAllTeachers(query);
      ApiResponse.success(res, teachers, "Teachers retrieved successfully");
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
