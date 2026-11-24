import { studentsRepository } from "./students.repository.js";
import { prisma } from "../../core/database/prisma.js";
import {
  CreateStudentDto,
  UpdateStudentDto,
  EnrollStudentDto,
  QueryStudentDto,
} from "./students.schema.js";
import { StudentResponse } from "./students.types.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../core/errors/app-error.js";
import { AttendanceStatus } from "@prisma/client";
import { PaginationMeta } from "../../core/utils/api-response.js";
import { AuthPayload } from "../../core/middleware/authenticate.js";

export class StudentsService {
  async getAllStudents(
    query?: QueryStudentDto,
    currentUser?: AuthPayload
  ): Promise<{
    items: StudentResponse[];
    pagination?: PaginationMeta;
  }> {
    const page = query?.page;
    const limit = query?.limit || 10;
    const filters: {
      search?: string;
      classId?: string;
      excludeClassId?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
      teacherId?: string;
    } = { ...query, limit };

    if (currentUser?.role?.toLowerCase() === "teacher") {
      filters.teacherId = currentUser.userId;
    }

    const { items, total } = await studentsRepository.findAll(filters);

    if (page) {
      const totalPages = Math.ceil(total / limit) || 1;
      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }

    return { items };
  }

  async getStudentById(id: string, currentUser?: AuthPayload): Promise<StudentResponse> {
    const student = await studentsRepository.findById(id);
    if (!student) {
      throw new NotFoundError(`Student with id '${id}' not found`);
    }

    if (currentUser?.role?.toLowerCase() === "teacher") {
      const isEnrolledInTeacherClass = await prisma.enrollment.findFirst({
        where: {
          studentId: id,
          class: { teacherId: currentUser.userId },
        },
      });

      if (!isEnrolledInTeacherClass) {
        throw new ForbiddenError("You are not authorized to view this student");
      }
    }

    return student;
  }

  async createStudent(dto: CreateStudentDto): Promise<StudentResponse> {
    // 1. If classId is specified, verify class exists and is active
    if (dto.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: dto.classId },
      });
      if (!cls) {
        throw new NotFoundError(`Class with id '${dto.classId}' not found`);
      }
      if (!cls.isActive) {
        throw new BadRequestError(`Cannot enroll student in inactive class '${cls.name}'`);
      }
    }

    // 2. Create the student
    const student = await studentsRepository.create({
      fullName: dto.fullName,
      phone: dto.phone,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      notes: dto.notes,
    });

    // 3. If classId provided, automatically enroll the student
    if (dto.classId) {
      await studentsRepository.enrollInClass(student.id, dto.classId);

      // Also auto-initialize attendance for today's lectures in this class if any exist
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const todayLectures = await prisma.lecture.findMany({
        where: {
          classId: dto.classId,
          date: today,
        },
      });

      for (const lecture of todayLectures) {
        await prisma.attendance.upsert({
          where: {
            lectureId_studentId: {
              lectureId: lecture.id,
              studentId: student.id,
            },
          },
          create: {
            lectureId: lecture.id,
            studentId: student.id,
            status: AttendanceStatus.PRESENT,
          },
          update: {},
        });
      }

      // Return refreshed student with enrollment populated
      const refreshed = await studentsRepository.findById(student.id);
      return refreshed || student;
    }

    return student;
  }

  async enrollStudent(dto: EnrollStudentDto): Promise<StudentResponse> {
    const student = await studentsRepository.findById(dto.studentId);
    if (!student) {
      throw new NotFoundError(`Student with id '${dto.studentId}' not found`);
    }

    const cls = await prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!cls) {
      throw new NotFoundError(`Class with id '${dto.classId}' not found`);
    }
    if (!cls.isActive) {
      throw new BadRequestError(`Cannot enroll student in inactive class '${cls.name}'`);
    }

    await studentsRepository.enrollInClass(dto.studentId, dto.classId);

    // Auto-create attendance record for today's lecture if one exists
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayLectures = await prisma.lecture.findMany({
      where: {
        classId: dto.classId,
        date: today,
      },
    });

    for (const lecture of todayLectures) {
      await prisma.attendance.upsert({
        where: {
          lectureId_studentId: {
            lectureId: lecture.id,
            studentId: student.id,
          },
        },
        create: {
          lectureId: lecture.id,
          studentId: student.id,
          status: AttendanceStatus.PRESENT,
        },
        update: {},
      });
    }

    const updated = await studentsRepository.findById(dto.studentId);
    return updated || student;
  }

  async updateStudent(id: string, dto: UpdateStudentDto): Promise<StudentResponse> {
    const existing = await studentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Student with id '${id}' not found`);
    }

    const updated = await studentsRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Student with id '${id}' not found`);
    }

    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    const existing = await studentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Student with id '${id}' not found`);
    }

    await studentsRepository.delete(id);
  }

  async getMetrics(currentUser?: AuthPayload) {
    const teacherId =
      currentUser?.role?.toLowerCase() === "teacher"
        ? currentUser.userId
        : undefined;
    return studentsRepository.getMetrics(teacherId);
  }
}

export const studentsService = new StudentsService();
