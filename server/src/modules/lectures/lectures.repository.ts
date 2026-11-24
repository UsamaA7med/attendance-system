import { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import {
  LectureResponse,
  CreateLectureData,
  UpdateLectureData,
  LectureFilters,
} from "./lectures.types.js";

type PrismaLectureWithRelations = Prisma.LectureGetPayload<{
  include: {
    class: {
      select: {
        id: true;
        name: true;
        room: true;
        teacher: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
    createdBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    attendances: {
      select: {
        status: true;
      };
    };
  };
}>;

function formatLectureResponse(l: PrismaLectureWithRelations): LectureResponse {
  const summary = {
    total: l.attendances.length,
    present: l.attendances.filter((a) => a.status === "PRESENT").length,
    absent: l.attendances.filter((a) => a.status === "ABSENT").length,
    late: l.attendances.filter((a) => a.status === "LATE").length,
    excused: l.attendances.filter((a) => a.status === "EXCUSED").length,
  };

  return {
    id: l.id,
    classId: l.classId,
    date: l.date.toISOString().split("T")[0],
    startTime: l.startTime,
    notes: l.notes,
    createdById: l.createdById,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    class: {
      id: l.class.id,
      name: l.class.name,
      room: l.class.room,
      teacher: l.class.teacher
        ? {
            id: l.class.teacher.id,
            name: l.class.teacher.name,
          }
        : undefined,
    },
    createdBy: {
      id: l.createdBy.id,
      name: l.createdBy.name,
      email: l.createdBy.email,
    },
    attendanceSummary: summary,
  };
}

class LecturesRepository {
  async findAll(filters?: LectureFilters): Promise<{ items: LectureResponse[]; total: number }> {
    const where: Prisma.LectureWhereInput = {};

    if (filters?.classId) {
      where.classId = filters.classId;
    }

    if (filters?.teacherId) {
      where.class = {
        teacherId: filters.teacherId,
      };
    }

    if (filters?.date) {
      where.date = new Date(`${filters.date}T00:00:00.000Z`);
    } else if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
      }
      if (filters.endDate) {
        where.date.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
      }
    }

    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        { class: { name: { contains: search, mode: "insensitive" } } },
        { class: { room: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const include = {
      class: {
        select: {
          id: true,
          name: true,
          room: true,
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attendances: {
        select: {
          status: true,
        },
      },
    };

    const countPromise = prisma.lecture.count({ where });
    const limit = filters?.limit || 10;
    const findPromise =
      filters?.page
        ? prisma.lecture.findMany({
            where,
            skip: (filters.page - 1) * limit,
            take: limit,
            include,
            orderBy: [{ date: "desc" as const }, { startTime: "asc" as const }],
          })
        : prisma.lecture.findMany({
            where,
            include,
            orderBy: [{ date: "desc" as const }, { startTime: "asc" as const }],
          });

    const [total, lectures] = await Promise.all([countPromise, findPromise]);

    return {
      items: lectures.map(formatLectureResponse),
      total,
    };
  }

  async findById(id: string): Promise<LectureResponse | null> {
    const found = await prisma.lecture.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            room: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
      },
    });

    return found ? formatLectureResponse(found) : null;
  }

  async findByClassDateAndTime(
    classId: string,
    date: Date,
    startTime: string
  ): Promise<LectureResponse | null> {
    const found = await prisma.lecture.findUnique({
      where: {
        classId_date_startTime: {
          classId,
          date,
          startTime,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            room: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
      },
    });

    return found ? formatLectureResponse(found) : null;
  }

  async create(data: CreateLectureData): Promise<LectureResponse> {
    const created = await prisma.lecture.create({
      data: {
        classId: data.classId,
        date: data.date,
        startTime: data.startTime,
        notes: data.notes ?? null,
        createdById: data.createdById,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            room: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
      },
    });

    return formatLectureResponse(created);
  }

  async update(id: string, data: UpdateLectureData): Promise<LectureResponse> {
    const updatePayload: Prisma.LectureUpdateInput = {};
    if (data.date) updatePayload.date = data.date;
    if (data.startTime) updatePayload.startTime = data.startTime;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const updated = await prisma.lecture.update({
      where: { id },
      data: updatePayload,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            room: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
      },
    });

    return formatLectureResponse(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.lecture.delete({ where: { id } });
  }
}

export const lecturesRepository = new LecturesRepository();
