import { Request, Response, NextFunction } from "express";
import { studentsService } from "./students.service.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import {
  CreateStudentDto,
  UpdateStudentDto,
  EnrollStudentDto,
  QueryStudentDto,
} from "./students.schema.js";

export class StudentsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentsService.getAllStudents(
        req.query as unknown as QueryStudentDto
      );
      if (result.pagination) {
        ApiResponse.paginated(
          res,
          result.items,
          result.pagination,
          "Students retrieved successfully"
        );
      } else {
        ApiResponse.success(res, result.items, "Students retrieved successfully");
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const student = await studentsService.getStudentById(id);
      ApiResponse.success(res, student, "Student retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentsService.createStudent(
        req.body as CreateStudentDto
      );
      ApiResponse.created(res, student, "Student created successfully");
    } catch (error) {
      next(error);
    }
  }

  async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentsService.enrollStudent(
        req.body as EnrollStudentDto
      );
      ApiResponse.success(res, student, "Student enrolled successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const student = await studentsService.updateStudent(
        id,
        req.body as UpdateStudentDto
      );
      ApiResponse.success(res, student, "Student updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await studentsService.deleteStudent(id);
      ApiResponse.success(res, null, "Student deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const studentsController = new StudentsController();
