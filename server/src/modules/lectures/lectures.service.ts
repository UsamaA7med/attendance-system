import { lecturesRepository } from "./lectures.repository.js";
import { prisma } from "../../core/database/prisma.js";
import {
  CreateLectureDto,
  UpdateLectureDto,
  QueryLectureDto,
  UpdateLectureAttendanceDto,
} from "./lectures.schema.js";
import { LectureResponse, LectureFilters } from "./lectures.types.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from "../../core/errors/app-error.js";
import { AttendanceStatus } from "@prisma/client";
import { PaginationMeta } from "../../core/utils/api-response.js";
import { AuthPayload } from "../../core/middleware/authenticate.js";

export interface StudentAttendanceItem {
  id: string; // Attendance record id
  studentId: string;
  fullName: string;
  phone: string | null;
  parentPhone: string;
  status: AttendanceStatus;
  note: string | null;
  markedAt: string | null;
  markedByName: string | null;
}

export class LecturesService {
  async getAllLectures(
    query?: QueryLectureDto,
    currentUser?: AuthPayload
  ): Promise<{
    items: LectureResponse[];
    pagination?: PaginationMeta;
  }> {
    const effectiveQuery: LectureFilters = { ...query };
    if (currentUser?.role?.toLowerCase() === "teacher") {
      effectiveQuery.teacherId = currentUser.userId;
    }

    const page = effectiveQuery?.page;
    const limit = effectiveQuery?.limit || 10;
    const { items, total } = await lecturesRepository.findAll({ ...effectiveQuery, limit });

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

  async getLectureById(id: string, currentUser?: AuthPayload): Promise<LectureResponse> {
    const lecture = await lecturesRepository.findById(id);
    if (!lecture) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      lecture.class.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to access this lecture");
    }

    return lecture;
  }

  async createLecture(
    userId: string,
    dto: CreateLectureDto,
    currentUser?: AuthPayload
  ): Promise<LectureResponse> {
    // 1. Verify class exists & find enrolled students
    const classExists = await prisma.class.findUnique({
      where: { id: dto.classId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          select: { studentId: true },
        },
      },
    });

    if (!classExists) {
      throw new NotFoundError(`Class with id '${dto.classId}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      classExists.teacherId !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to schedule lectures for this class");
    }

    // 2. Validate UTC Date
    const lectureDate = new Date(`${dto.date}T00:00:00.000Z`);
    if (isNaN(lectureDate.getTime())) {
      throw new BadRequestError("Invalid date format provided");
    }

    // 3. Ensure uniqueness per class per date and start time
    const existing = await lecturesRepository.findByClassDateAndTime(
      dto.classId,
      lectureDate,
      dto.startTime
    );
    if (existing) {
      throw new ConflictError(
        `A lecture already exists for "${classExists.name}" on ${dto.date} at ${dto.startTime}`
      );
    }

    // 4. Create the lecture
    const createdLecture = await lecturesRepository.create({
      classId: dto.classId,
      date: lectureDate,
      startTime: dto.startTime,
      notes: dto.notes ?? null,
      createdById: userId,
    });

    // 5. Automatically initialize attendance records for active enrolled students
    if (classExists.enrollments.length > 0) {
      const attendanceData = classExists.enrollments.map((e) => ({
        lectureId: createdLecture.id,
        studentId: e.studentId,
        status: AttendanceStatus.PRESENT,
      }));

      await prisma.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
      });

      // Refetch with attendances populated
      return (await lecturesRepository.findById(createdLecture.id)) || createdLecture;
    }

    return createdLecture;
  }

  async updateLecture(
    id: string,
    dto: UpdateLectureDto,
    currentUser?: AuthPayload
  ): Promise<LectureResponse> {
    const existing = await lecturesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      existing.class.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to update this lecture");
    }

    let parsedDate: Date | undefined;
    if (dto.date) {
      parsedDate = new Date(`${dto.date}T00:00:00.000Z`);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestError("Invalid date format provided");
      }
    }

    // If changing date or start time, check uniqueness
    const targetDate = parsedDate || new Date(`${existing.date}T00:00:00.000Z`);
    const targetStartTime = dto.startTime || existing.startTime;

    if (dto.date || dto.startTime) {
      const conflict = await lecturesRepository.findByClassDateAndTime(
        existing.classId,
        targetDate,
        targetStartTime
      );
      if (conflict && conflict.id !== id) {
        throw new ConflictError(
          `Another lecture already exists for this class on ${dto.date || existing.date} at ${targetStartTime}`
        );
      }
    }

    return lecturesRepository.update(id, {
      date: parsedDate,
      startTime: dto.startTime,
      notes: dto.notes,
    });
  }

  async deleteLecture(id: string, currentUser?: AuthPayload): Promise<void> {
    const existing = await lecturesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      existing.class.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to delete this lecture");
    }

    await lecturesRepository.delete(id);
  }

  async getLectureAttendance(
    lectureId: string,
    currentUser?: AuthPayload
  ): Promise<{
    lecture: LectureResponse;
    students: StudentAttendanceItem[];
  }> {
    const lecture = await this.getLectureById(lectureId, currentUser);

    // Get active students enrolled in this class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: lecture.classId, status: "ACTIVE" },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            parentPhone: true,
          },
        },
      },
      orderBy: { student: { fullName: "asc" } },
    });

    // Get attendance records for this lecture
    const records = await prisma.attendance.findMany({
      where: { lectureId },
      include: {
        markedBy: { select: { name: true } },
      },
    });

    const recordMap = new Map(records.map((r) => [r.studentId, r]));

    const students: StudentAttendanceItem[] = enrollments.map((e) => {
      const rec = recordMap.get(e.studentId);
      return {
        id: rec ? rec.id : `virtual-${e.studentId}`,
        studentId: e.studentId,
        fullName: e.student.fullName,
        phone: e.student.phone,
        parentPhone: e.student.parentPhone,
        status: rec ? rec.status : AttendanceStatus.PRESENT,
        note: rec ? rec.note : null,
        markedAt: rec && rec.markedAt ? rec.markedAt.toISOString() : null,
        markedByName: rec && rec.markedBy ? rec.markedBy.name : null,
      };
    });

    return { lecture, students };
  }

  async updateLectureAttendance(
    lectureId: string,
    markerUserId: string,
    dto: UpdateLectureAttendanceDto,
    currentUser?: AuthPayload
  ): Promise<void> {
    const lecture = await this.getLectureById(lectureId, currentUser);

    const now = new Date();
    for (const item of dto.records) {
      await prisma.attendance.upsert({
        where: {
          lectureId_studentId: {
            lectureId,
            studentId: item.studentId,
          },
        },
        create: {
          lectureId,
          studentId: item.studentId,
          status: item.status,
          note: item.note ?? null,
          markedById: markerUserId,
          markedAt: now,
        },
        update: {
          status: item.status,
          note: item.note ?? null,
          markedById: markerUserId,
          markedAt: now,
        },
      });
    }
  }
}

export const lecturesService = new LecturesService();
