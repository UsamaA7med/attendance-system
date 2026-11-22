import { Request, Response, NextFunction } from "express";
import { reportsService } from "./reports.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";

export class ReportsController {
  async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reportsService.getOverviewStats();
      ApiResponse.success(res, stats, "Reports overview retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
