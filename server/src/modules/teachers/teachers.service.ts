import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { teachersRepository } from "./teachers.repository.js";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  QueryTeacherDto,
} from "./teachers.schema.js";
import { TeacherResponse } from "./teachers.types.js";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../../core/errors/app-error.js";
import { PaginationMeta } from "../../core/utils/api-response.js";

export class TeachersService {
  async getAllTeachers(query?: QueryTeacherDto): Promise<{
    items: TeacherResponse[];
    pagination?: PaginationMeta;
  }> {
    const page = query?.page;
    const limit = query?.limit || 10;
    const { items, total } = await teachersRepository.findAll({ ...query, limit });

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

  async getTeacherById(id: string): Promise<TeacherResponse> {
    const teacher = await teachersRepository.findById(id);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id '${id}' not found`);
    }
    return teacher;
  }

  async createTeacher(dto: CreateTeacherDto): Promise<TeacherResponse> {
    const existing = await teachersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return teachersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      department: dto.department,
      position: dto.position,
      isActive: dto.isActive,
    });
  }

  async updateTeacher(id: string, dto: UpdateTeacherDto): Promise<TeacherResponse> {
    const teacher = await teachersRepository.findById(id);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id '${id}' not found`);
    }

    if (dto.email && dto.email.toLowerCase() !== teacher.email.toLowerCase()) {
      const emailConflict = await teachersRepository.findByEmail(dto.email);
      if (emailConflict && emailConflict.id !== id) {
        throw new ConflictError("Email is already taken by another account");
      }
    }

    let passwordHash: string | undefined;
    if (dto.password && dto.password.trim().length > 0) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await teachersRepository.update(id, {
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      department: dto.department,
      position: dto.position,
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundError(`Teacher with id '${id}' not found`);
    }

    return updated;
  }

  async deleteTeacher(id: string): Promise<void> {
    const rawUser = await teachersRepository.findRawUserById(id);
    if (!rawUser) {
      throw new NotFoundError(`Teacher with id '${id}' not found`);
    }

    if (rawUser.role !== Role.TEACHER) {
      throw new BadRequestError("The specified user account is not a teacher");
    }

    // Check referential constraints before deleting to prevent database errors
    if (rawUser.taughtClasses && rawUser.taughtClasses.length > 0) {
      const classNames = rawUser.taughtClasses.map((c) => c.name).join(", ");
      throw new ConflictError(
        `Cannot delete teacher '${rawUser.name}' because they are assigned to ${rawUser.taughtClasses.length} class(es): [${classNames}]. Reassign or remove these classes first.`
      );
    }

    if (
      (rawUser.createdLectures && rawUser.createdLectures.length > 0) ||
      (rawUser.markedAttendances && rawUser.markedAttendances.length > 0)
    ) {
      throw new ConflictError(
        `Cannot delete teacher '${rawUser.name}' because attendance history or lectures are linked to this account. You can deactivate their account instead.`
      );
    }

    await teachersRepository.delete(id);
  }

  async getMetrics() {
    return teachersRepository.getMetrics();
  }
}

export const teachersService = new TeachersService();
