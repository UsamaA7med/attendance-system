import { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import {
  ClassResponse,
  CreateClassData,
  UpdateClassData,
  ClassFilters,
} from "./classes.types.js";

type PrismaClassWithRelations = Prisma.ClassGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
        department: true;
      };
    };
    lectures: {
      select: {
        id: true;
        date: true;
        startTime: true;
      };
    };
    _count: {
      select: {
        enrollments: true;
        lectures: true;
      };
    };
  };
}>;

function formatClassResponse(c: PrismaClassWithRelations): ClassResponse {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    room: c.room,
    isActive: c.isActive,
    teacherId: c.teacherId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    teacher: {
      id: c.teacher.id,
      name: c.teacher.name,
      email: c.teacher.email,
      phone: c.teacher.phone,
      department: c.teacher.department,
    },
    lectures: c.lectures.map((l) => ({
      id: l.id,
      date: l.date.toISOString().split("T")[0],
      startTime: l.startTime,
    })),
    enrollmentsCount: c._count.enrollments,
    lecturesCount: c._count.lectures,
  };
}

class ClassesRepository {
  async findAll(filters?: ClassFilters): Promise<{ items: ClassResponse[]; total: number }> {
    const where: Prisma.ClassWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.teacherId) {
      where.teacherId = filters.teacherId;
    }

    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { room: { contains: search, mode: "insensitive" } },
        { teacher: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const include = {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
        },
      },
      lectures: {
        select: {
          id: true,
          date: true,
          startTime: true,
        },
        orderBy: [{ date: "desc" as const }, { startTime: "asc" as const }],
        take: 5,
      },
      _count: {
        select: {
          enrollments: true,
          lectures: true,
        },
      },
    };

    const countPromise = prisma.class.count({ where });
    const limit = filters?.limit || 10;
    const findPromise =
      filters?.page
        ? prisma.class.findMany({
            where,
            skip: (filters.page - 1) * limit,
            take: limit,
            include,
            orderBy: { createdAt: "desc" },
          })
        : prisma.class.findMany({
            where,
            include,
            orderBy: { createdAt: "desc" },
          });

    const [total, classes] = await Promise.all([countPromise, findPromise]);

    return {
      items: classes.map(formatClassResponse),
      total,
    };
  }

  async findById(id: string): Promise<ClassResponse | null> {
    const found = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
          },
        },
        lectures: {
          select: {
            id: true,
            date: true,
            startTime: true,
          },
          orderBy: [{ date: "desc" }, { startTime: "asc" }],
        },
        _count: {
          select: {
            enrollments: true,
            lectures: true,
          },
        },
      },
    });

    return found ? formatClassResponse(found) : null;
  }

  async create(data: CreateClassData): Promise<ClassResponse> {
    const created = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        room: data.room ?? null,
        teacherId: data.teacherId,
        isActive: data.isActive ?? true,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
          },
        },
        lectures: {
          select: {
            id: true,
            date: true,
            startTime: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lectures: true,
          },
        },
      },
    });

    return formatClassResponse(created);
  }

  async update(id: string, data: UpdateClassData): Promise<ClassResponse | null> {
    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.teacherId !== undefined && { teacherId: data.teacherId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
          },
        },
        lectures: {
          select: {
            id: true,
            date: true,
            startTime: true,
          },
          orderBy: [{ date: "desc" }, { startTime: "asc" }],
        },
        _count: {
          select: {
            enrollments: true,
            lectures: true,
          },
        },
      },
    });

    return formatClassResponse(updated);
  }

  async delete(id: string): Promise<boolean> {
    await prisma.class.delete({
      where: { id },
    });
    return true;
  }

  async getMetrics(teacherId?: string): Promise<{
    totalClasses: number;
    activeClasses: number;
    totalLectures: number;
    totalEnrollments: number;
  }> {
    const classWhere: Prisma.ClassWhereInput = teacherId ? { teacherId } : {};

    const [totalClasses, activeClasses, totalLectures, totalEnrollments] = await Promise.all([
      prisma.class.count({ where: classWhere }),
      prisma.class.count({ where: { ...classWhere, isActive: true } }),
      prisma.lecture.count({ where: teacherId ? { class: { teacherId } } : {} }),
      prisma.enrollment.count({
        where: {
          ...(teacherId ? { class: { teacherId } } : {}),
          status: "ACTIVE",
        },
      }),
    ]);

    return {
      totalClasses,
      activeClasses,
      totalLectures,
      totalEnrollments,
    };
  }
}

export const classesRepository = new ClassesRepository();
