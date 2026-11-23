import { Request, Response, NextFunction } from "express";
import { attendanceService } from "./attendance.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { AttendanceQueryDto } from "./attendance.schema.js";

export class AttendanceController {
  async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || (req.body.userId as string);
      if (!userId) {
        ApiResponse.error(res, "User ID is required", 400);
        return;
      }
      const record = await attendanceService.checkIn(userId, req.body);
      ApiResponse.created(res, record, "Checked in successfully");
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || (req.body.userId as string);
      if (!userId) {
        ApiResponse.error(res, "User ID is required", 400);
        return;
      }
      const record = await attendanceService.checkOut(userId, req.body);
      ApiResponse.success(res, record, "Checked out successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await attendanceService.getRecords(req.query as AttendanceQueryDto);
      ApiResponse.success(res, records, "Attendance records retrieved");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const record = await attendanceService.getRecordById(id);
      ApiResponse.success(res, record, "Attendance record retrieved");
    } catch (error) {
      next(error);
    }
  }

  async getTodaySummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await attendanceService.getTodaySummary();
      ApiResponse.success(res, summary, "Today's attendance summary retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
