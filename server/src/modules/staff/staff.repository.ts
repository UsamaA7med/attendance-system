import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import {
  StaffResponse,
  CreateStaffData,
  UpdateStaffData,
  StaffMetrics,
} from "./staff.types.js";

type PrismaUserWithCounts = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        markedAttendances: true;
      };
    };
  };
}>;

function formatStaffResponse(user: PrismaUserWithCounts): StaffResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "staff",
    department: user.department || "Operations",
    position: user.position || "Staff",
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    markedAttendancesCount: user._count?.markedAttendances || 0,
  };
}

class StaffRepository {
  async findAll(filters?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: StaffResponse[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      role: Role.STAFF,
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
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    const include = {
      _count: {
        select: {
          markedAttendances: true,
        },
      },
    };

    const countPromise = prisma.user.count({ where });
    const limit = filters?.limit || 10;
    const findPromise = filters?.page
      ? prisma.user.findMany({
          where,
          skip: (filters.page - 1) * limit,
          take: limit,
          include,
          orderBy: { createdAt: "desc" },
        })
      : prisma.user.findMany({
          where,
          include,
          orderBy: { createdAt: "desc" },
        });

    const [total, users] = await Promise.all([countPromise, findPromise]);

    return {
      items: users.map(formatStaffResponse),
      total,
    };
  }

  async findById(id: string): Promise<StaffResponse | null> {
    const user = await prisma.user.findFirst({
      where: { id, role: Role.STAFF },
      include: {
        _count: {
          select: {
            markedAttendances: true,
          },
        },
      },
    });

    if (!user) return null;
    return formatStaffResponse(user);
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findRawUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        markedAttendances: { select: { id: true }, take: 1 },
        createdLectures: { select: { id: true }, take: 1 },
      },
    });
  }

  async create(data: CreateStaffData): Promise<StaffResponse> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        phone: data.phone,
        department: data.department || "Operations",
        position: data.position || "Staff",
        role: Role.STAFF,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            markedAttendances: true,
          },
        },
      },
    });

    return formatStaffResponse(user);
  }

  async update(id: string, data: UpdateStaffData): Promise<StaffResponse | null> {
    const updatePayload: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email.toLowerCase();
    if (data.passwordHash !== undefined) updatePayload.passwordHash = data.passwordHash;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.department !== undefined) updatePayload.department = data.department;
    if (data.position !== undefined) updatePayload.position = data.position;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updatePayload,
        include: {
          _count: {
            select: {
              markedAttendances: true,
            },
          },
        },
      });

      return formatStaffResponse(user);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getMetrics(): Promise<StaffMetrics> {
    const [totalCount, activeCount] = await Promise.all([
      prisma.user.count({ where: { role: Role.STAFF } }),
      prisma.user.count({ where: { role: Role.STAFF, isActive: true } }),
    ]);

    return {
      totalCount,
      activeCount,
      inactiveCount: totalCount - activeCount,
    };
  }
}

export const staffRepository = new StaffRepository();
