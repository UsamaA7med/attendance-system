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
} from "../../core/errors/app-error.js";
import { PaginationMeta } from "../../core/utils/api-response.js";

export class ClassesService {
  async getAllClasses(query?: QueryClassDto): Promise<{
    items: ClassResponse[];
    pagination?: PaginationMeta;
  }> {
    const { items, total } = await classesRepository.findAll(query);

    if (query?.page && query?.limit) {
      const totalPages = Math.ceil(total / query.limit) || 1;
      return {
        items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
          hasNextPage: query.page < totalPages,
          hasPrevPage: query.page > 1,
        },
      };
    }

    return { items };
  }

  async getClassById(id: string): Promise<ClassResponse> {
    const found = await classesRepository.findById(id);
    if (!found) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }
    return found;
  }

  async createClass(dto: CreateClassDto): Promise<ClassResponse> {
    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: dto.teacherId },
    });

    if (!teacher) {
      throw new NotFoundError(`Teacher with id '${dto.teacherId}' does not exist`);
    }

    if (!teacher.isActive) {
      throw new BadRequestError(`Assigned teacher '${teacher.name}' is currently inactive`);
    }

    return classesRepository.create({
      name: dto.name,
      description: dto.description,
      room: dto.room,
      teacherId: dto.teacherId,
      isActive: dto.isActive,
    });
  }

  async updateClass(id: string, dto: UpdateClassDto): Promise<ClassResponse> {
    const existing = await classesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Class with id '${id}' not found`);
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

    const updated = await classesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    return updated;
  }

  async deleteClass(id: string): Promise<void> {
    const existing = await classesRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Class with id '${id}' not found`);
    }

    await classesRepository.delete(id);
  }
}

export const classesService = new ClassesService();
