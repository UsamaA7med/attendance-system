import { classesRepository } from "./classes.repository.js";
import { prisma } from "../../core/database/prisma.js";
import {
  CreateClassDto,
  UpdateClassDto,
  QueryClassDto,
} from "./classes.schema.js";
import { ClassResponse } from "./classes.types.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../core/errors/app-error.js";
import { PaginationMeta } from "../../core/utils/api-response.js";
import { AuthPayload } from "../../core/middleware/authenticate.js";

export class ClassesService {
  async getAllClasses(
    query?: QueryClassDto,
    currentUser?: AuthPayload
  ): Promise<{
    items: ClassResponse[];
    pagination?: PaginationMeta;
  }> {
    const effectiveQuery = { ...query };
    if (currentUser?.role?.toLowerCase() === "teacher") {
      effectiveQuery.teacherId = currentUser.userId;
    }

    const page = effectiveQuery?.page;
    const limit = effectiveQuery?.limit || 10;
    const { items, total } = await classesRepository.findAll({ ...effectiveQuery, limit });

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

  async getClassById(id: string, currentUser?: AuthPayload): Promise<ClassResponse> {
    const found = await classesRepository.findById(id);
    if (!found) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      found.teacherId !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to access this class");
    }

    return found;
  }

  async createClass(dto: CreateClassDto, currentUser?: AuthPayload): Promise<ClassResponse> {
    let teacherId = dto.teacherId;
    if (currentUser?.role?.toLowerCase() === "teacher") {
      teacherId = currentUser.userId;
    } else if (!teacherId) {
      throw new BadRequestError("Teacher ID is required");
    }

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundError(`Teacher with id '${teacherId}' does not exist`);
    }

    if (!teacher.isActive) {
      throw new BadRequestError(`Assigned teacher '${teacher.name}' is currently inactive`);
    }

    return classesRepository.create({
      name: dto.name,
      description: dto.description,
      room: dto.room,
      teacherId,
      isActive: dto.isActive,
    });
  }

  async updateClass(
    id: string,
    dto: UpdateClassDto,
    currentUser?: AuthPayload
  ): Promise<ClassResponse> {
    const existing = await classesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    if (currentUser?.role?.toLowerCase() === "teacher") {
      if (existing.teacherId !== currentUser.userId) {
        throw new ForbiddenError("You are not authorized to update this class");
      }
      if (dto.teacherId && dto.teacherId !== currentUser.userId) {
        throw new ForbiddenError("Teachers cannot reassign classes to another teacher");
      }
    }

    if (dto.teacherId && dto.teacherId !== existing.teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: dto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundError(`Teacher with id '${dto.teacherId}' does not exist`);
      }

      if (!teacher.isActive) {
        throw new BadRequestError(`Assigned teacher '${teacher.name}' is currently inactive`);
      }
    }

    const updateData = { ...dto };
    if (currentUser?.role?.toLowerCase() === "teacher") {
      updateData.teacherId = currentUser.userId;
    }

    const updated = await classesRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    return updated;
  }

  async deleteClass(id: string, currentUser?: AuthPayload): Promise<void> {
    const existing = await classesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    if (
      currentUser?.role?.toLowerCase() === "teacher" &&
      existing.teacherId !== currentUser.userId
    ) {
      throw new ForbiddenError("You are not authorized to delete this class");
    }

    await classesRepository.delete(id);
  }

  async getMetrics(currentUser?: AuthPayload) {
    const teacherId =
      currentUser?.role?.toLowerCase() === "teacher"
        ? currentUser.userId
        : undefined;
    return classesRepository.getMetrics(teacherId);
  }
}

export const classesService = new ClassesService();
