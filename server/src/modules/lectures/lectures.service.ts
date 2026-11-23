import { lecturesRepository } from "./lectures.repository.js";
import { prisma } from "../../core/database/prisma.js";
import {
  CreateLectureDto,
  UpdateLectureDto,
  QueryLectureDto,
  UpdateLectureAttendanceDto,
} from "./lectures.schema.js";
import { LectureResponse } from "./lectures.types.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../core/errors/app-error.js";
import { AttendanceStatus } from "@prisma/client";

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
  async getAllLectures(query?: QueryLectureDto): Promise<LectureResponse[]> {
    return lecturesRepository.findAll(query);
  }

  async getLectureById(id: string): Promise<LectureResponse> {
    const lecture = await lecturesRepository.findById(id);
    if (!lecture) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
    }
    return lecture;
  }

  async createLecture(userId: string, dto: CreateLectureDto): Promise<LectureResponse> {
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

  async updateLecture(id: string, dto: UpdateLectureDto): Promise<LectureResponse> {
    const existing = await lecturesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
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

  async deleteLecture(id: string): Promise<void> {
    const existing = await lecturesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Lecture with id '${id}' not found`);
    }
    await lecturesRepository.delete(id);
  }

  async getLectureAttendance(lectureId: string): Promise<{
    lecture: LectureResponse;
    students: StudentAttendanceItem[];
  }> {
    const lecture = await this.getLectureById(lectureId);

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
    dto: UpdateLectureAttendanceDto
  ): Promise<void> {
    const lecture = await this.getLectureById(lectureId);

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
