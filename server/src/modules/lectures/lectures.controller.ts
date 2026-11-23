import { Request, Response, NextFunction } from "express";
import { lecturesService } from "./lectures.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { QueryLectureDto, UpdateLectureAttendanceDto } from "./lectures.schema.js";

export class LecturesController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as QueryLectureDto;
      const lectures = await lecturesService.getAllLectures(query);
      ApiResponse.success(res, lectures, "Lectures retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const lecture = await lecturesService.getLectureById(id);
      ApiResponse.success(res, lecture, "Lecture retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, "Authentication required", 401);
        return;
      }
      const created = await lecturesService.createLecture(userId, req.body);
      ApiResponse.created(res, created, "Lecture created successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await lecturesService.updateLecture(id, req.body);
      ApiResponse.success(res, updated, "Lecture updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await lecturesService.deleteLecture(id);
      ApiResponse.success(res, null, "Lecture deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data = await lecturesService.getLectureAttendance(id);
      ApiResponse.success(res, data, "Lecture attendance retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, "Authentication required", 401);
        return;
      }
      const body = req.body as UpdateLectureAttendanceDto;
      await lecturesService.updateLectureAttendance(id, userId, body);
      ApiResponse.success(res, null, "Lecture attendance updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const lecturesController = new LecturesController();
