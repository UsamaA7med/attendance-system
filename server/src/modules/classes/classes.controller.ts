import { Request, Response, NextFunction } from "express";
import { classesService } from "./classes.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryClassDto } from "./classes.schema.js";

export class ClassesController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryClassDto;
      const classes = await classesService.getAllClasses(query);
      ApiResponse.success(res, classes, "Classes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const foundClass = await classesService.getClassById(id);
      ApiResponse.success(res, foundClass, "Class retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await classesService.createClass(req.body);
      ApiResponse.created(res, created, "Class created successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await classesService.updateClass(id, req.body);
      ApiResponse.success(res, updated, "Class updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await classesService.deleteClass(id);
      ApiResponse.success(res, null, "Class deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const classesController = new ClassesController();
