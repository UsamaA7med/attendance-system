import { Request, Response, NextFunction } from "express";
import { classesService } from "./classes.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryClassDto } from "./classes.schema.js";

export class ClassesController {
  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await classesService.getMetrics(req.user);
      ApiResponse.success(res, metrics, "Class metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryClassDto;
      const result = await classesService.getAllClasses(query, req.user);
      if (result.pagination) {
        ApiResponse.paginated(
          res,
          result.items,
          result.pagination,
          "Classes retrieved successfully"
        );
      } else {
        ApiResponse.success(res, result.items, "Classes retrieved successfully");
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const foundClass = await classesService.getClassById(id, req.user);
      ApiResponse.success(res, foundClass, "Class retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await classesService.createClass(req.body, req.user);
      ApiResponse.created(res, created, "Class created successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await classesService.updateClass(id, req.body, req.user);
      ApiResponse.success(res, updated, "Class updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await classesService.deleteClass(id, req.user);
      ApiResponse.success(res, null, "Class deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const classesController = new ClassesController();
