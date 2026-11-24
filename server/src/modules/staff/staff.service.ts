import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { staffRepository } from "./staff.repository.js";
import { CreateStaffDto, UpdateStaffDto, QueryStaffDto } from "./staff.schema.js";
import { StaffResponse, StaffMetrics } from "./staff.types.js";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../core/errors/app-error.js";
import { PaginationMeta } from "../../core/utils/api-response.js";

export class StaffService {
  async getAllStaff(query?: QueryStaffDto): Promise<{
    items: StaffResponse[];
    pagination?: PaginationMeta;
  }> {
    const page = query?.page;
    const limit = query?.limit || 10;
    const { items, total } = await staffRepository.findAll({ ...query, limit });

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

  async getStaffById(id: string): Promise<StaffResponse> {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError(`Staff member with id '${id}' not found`);
    }
    return staff;
  }

  async createStaff(dto: CreateStaffDto): Promise<StaffResponse> {
    const existing = await staffRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return staffRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      department: dto.department,
      position: dto.position,
      isActive: dto.isActive,
    });
  }

  async updateStaff(id: string, dto: UpdateStaffDto): Promise<StaffResponse> {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError(`Staff member with id '${id}' not found`);
    }

    if (dto.email && dto.email.toLowerCase() !== staff.email.toLowerCase()) {
      const emailConflict = await staffRepository.findByEmail(dto.email);
      if (emailConflict && emailConflict.id !== id) {
        throw new ConflictError("Email is already taken by another account");
      }
    }

    let passwordHash: string | undefined;
    if (dto.password && dto.password.trim().length > 0) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await staffRepository.update(id, {
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      department: dto.department,
      position: dto.position,
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundError(`Staff member with id '${id}' not found`);
    }

    return updated;
  }

  async deleteStaff(id: string): Promise<void> {
    const rawUser = await staffRepository.findRawUserById(id);
    if (!rawUser) {
      throw new NotFoundError(`Staff member with id '${id}' not found`);
    }

    if (rawUser.role !== Role.STAFF) {
      throw new BadRequestError("The specified user account is not a staff member");
    }

    if (
      (rawUser.createdLectures && rawUser.createdLectures.length > 0) ||
      (rawUser.markedAttendances && rawUser.markedAttendances.length > 0)
    ) {
      throw new ConflictError(
        `Cannot delete staff member '${rawUser.name}' because attendance history or lectures are linked to this account. You can deactivate their account instead.`
      );
    }

    await staffRepository.delete(id);
  }

  async getMetrics(): Promise<StaffMetrics> {
    return staffRepository.getMetrics();
  }
}

export const staffService = new StaffService();
