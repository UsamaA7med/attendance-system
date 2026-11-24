import { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import {
  StudentResponse,
  CreateStudentInput,
  StudentEnrollmentItem,
} from "./students.types.js";

type PrismaStudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    enrollments: {
      include: {
        class: {
          select: {
            id: true;
            name: true;
            room: true;
          };
        };
      };
    };
  };
}>;

function formatStudentResponse(s: PrismaStudentWithRelations): StudentResponse {
  const enrollments: StudentEnrollmentItem[] = s.enrollments.map((e) => ({
    id: e.id,
    classId: e.classId,
    className: e.class.name,
    room: e.class.room,
    status: e.status,
    enrolledAt: e.enrolledAt.toISOString(),
  }));

  return {
    id: s.id,
    fullName: s.fullName,
    phone: s.phone,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    notes: s.notes,
    isActive: s.isActive,
    enrollmentDate: s.enrollmentDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    enrollments,
  };
}

export class StudentsRepository {
  async findAll(filters?: {
    search?: string;
    classId?: string;
    excludeClassId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    teacherId?: string;
  }): Promise<{ items: StudentResponse[]; total: number }> {
    const where: Prisma.StudentWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { parentName: { contains: q, mode: "insensitive" } },
        { parentPhone: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    if (filters?.teacherId) {
      where.enrollments = {
        some: {
          ...(filters.classId ? { classId: filters.classId } : {}),
          class: {
            teacherId: filters.teacherId,
          },
          status: "ACTIVE",
        },
      };
    } else if (filters?.classId) {
      where.enrollments = {
        some: {
          classId: filters.classId,
          status: "ACTIVE",
        },
      };
    } else if (filters?.excludeClassId) {
      where.enrollments = {
        none: {
          classId: filters.excludeClassId,
          status: "ACTIVE",
        },
      };
    }

    const include = {
      enrollments: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              room: true,
            },
          },
        },
      },
    };

    const countPromise = prisma.student.count({ where });
    const limit = filters?.limit || 10;
    const findPromise =
      filters?.page
        ? prisma.student.findMany({
            where,
            skip: (filters.page - 1) * limit,
            take: limit,
            include,
            orderBy: { fullName: "asc" },
          })
        : prisma.student.findMany({
            where,
            include,
            orderBy: { fullName: "asc" },
          });

    const [total, students] = await Promise.all([countPromise, findPromise]);

    return {
      items: students.map(formatStudentResponse),
      total,
    };
  }

  async findById(id: string): Promise<StudentResponse | null> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                room: true,
              },
            },
          },
        },
      },
    });

    return student ? formatStudentResponse(student) : null;
  }

  async findByParentPhoneAndName(
    parentPhone: string,
    fullName: string
  ): Promise<StudentResponse | null> {
    const student = await prisma.student.findFirst({
      where: {
        parentPhone,
        fullName: { equals: fullName, mode: "insensitive" },
      },
      include: {
        enrollments: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                room: true,
              },
            },
          },
        },
      },
    });

    return student ? formatStudentResponse(student) : null;
  }

  async create(data: CreateStudentInput): Promise<StudentResponse> {
    const created = await prisma.student.create({
      data: {
        fullName: data.fullName,
        phone: data.phone || null,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        notes: data.notes || null,
        isActive: true,
      },
      include: {
        enrollments: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                room: true,
              },
            },
          },
        },
      },
    });

    return formatStudentResponse(created);
  }

  async enrollInClass(studentId: string, classId: string): Promise<void> {
    await prisma.enrollment.upsert({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
      create: {
        studentId,
        classId,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });
  }

  async update(id: string, data: Partial<CreateStudentInput> & { isActive?: boolean }): Promise<StudentResponse | null> {
    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.parentName !== undefined && { parentName: data.parentName }),
        ...(data.parentPhone !== undefined && { parentPhone: data.parentPhone }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        enrollments: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                room: true,
              },
            },
          },
        },
      },
    });

    return formatStudentResponse(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.enrollment.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
    ]);
  }

  async getMetrics(teacherId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalEnrollments: number;
  }> {
    const studentWhere: Prisma.StudentWhereInput = teacherId
      ? { enrollments: { some: { class: { teacherId }, status: "ACTIVE" } } }
      : {};

    const [total, active, totalEnrollments] = await Promise.all([
      prisma.student.count({ where: studentWhere }),
      prisma.student.count({ where: { ...studentWhere, isActive: true } }),
      prisma.enrollment.count({
        where: {
          ...(teacherId ? { class: { teacherId } } : {}),
          status: "ACTIVE",
        },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      totalEnrollments,
    };
  }
}

export const studentsRepository = new StudentsRepository();
