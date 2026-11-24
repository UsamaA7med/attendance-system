import { Request, Response, NextFunction } from "express";
import { staffService } from "./staff.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryStaffDto } from "./staff.schema.js";

export class StaffController {
  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await staffService.getMetrics();
      ApiResponse.success(res, metrics, "Staff metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryStaffDto;
      const result = await staffService.getAllStaff(query);
      if (result.pagination) {
        ApiResponse.paginated(
          res,
          result.items,
          result.pagination,
          "Staff members retrieved successfully"
        );
      } else {
        ApiResponse.success(res, result.items, "Staff members retrieved successfully");
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const staff = await staffService.getStaffById(id);
      ApiResponse.success(res, staff, "Staff member retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await staffService.createStaff(req.body);
      ApiResponse.created(res, staff, "Staff member registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const staff = await staffService.updateStaff(id, req.body);
      ApiResponse.success(res, staff, "Staff member updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await staffService.deleteStaff(id);
      ApiResponse.success(res, null, "Staff member deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
