import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import {
  TeacherResponse,
  CreateTeacherData,
  UpdateTeacherData,
} from "./teachers.types.js";

type PrismaUserWithClasses = Prisma.UserGetPayload<{
  include: {
    taughtClasses: {
      select: {
        id: true;
        name: true;
        room: true;
        isActive: true;
      };
    };
  };
}>;

function formatTeacherResponse(user: PrismaUserWithClasses): TeacherResponse {
  const classes = user.taughtClasses.map((c) => ({
    id: c.id,
    name: c.name,
    room: c.room,
    isActive: c.isActive,
  }));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "teacher",
    department: user.department || "General",
    position: user.position || "Teacher",
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    classesCount: classes.length,
    classes,
  };
}

class TeachersRepository {
  async findAll(filters?: {
    search?: string;
    isActive?: boolean;
  }): Promise<TeacherResponse[]> {
    const where: Prisma.UserWhereInput = {
      role: Role.TEACHER,
    };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        taughtClasses: {
          select: {
            id: true,
            name: true,
            room: true,
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map(formatTeacherResponse);
  }

  async findById(id: string): Promise<TeacherResponse | null> {
    const user = await prisma.user.findFirst({
      where: {
        id,
        role: Role.TEACHER,
      },
      include: {
        taughtClasses: {
          select: {
            id: true,
            name: true,
            room: true,
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    return user ? formatTeacherResponse(user) : null;
  }

  async findRawUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        taughtClasses: { select: { id: true, name: true } },
        createdLectures: { select: { id: true }, take: 1 },
        markedAttendances: { select: { id: true }, take: 1 },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: CreateTeacherData): Promise<TeacherResponse> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        phone: data.phone,
        role: Role.TEACHER,
        department: data.department || "General",
        position: data.position || "Teacher",
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        taughtClasses: {
          select: {
            id: true,
            name: true,
            room: true,
            isActive: true,
          },
        },
      },
    });

    return formatTeacherResponse(user);
  }

  async update(id: string, data: UpdateTeacherData): Promise<TeacherResponse | null> {
    const updatePayload: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email.toLowerCase();
    if (data.passwordHash !== undefined) updatePayload.passwordHash = data.passwordHash;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.department !== undefined) updatePayload.department = data.department;
    if (data.position !== undefined) updatePayload.position = data.position;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updatePayload,
      include: {
        taughtClasses: {
          select: {
            id: true,
            name: true,
            room: true,
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    return formatTeacherResponse(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}

export const teachersRepository = new TeachersRepository();
