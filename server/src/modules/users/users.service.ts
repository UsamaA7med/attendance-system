import bcrypt from "bcryptjs";
import { usersRepository } from "./users.repository.js";
import { CreateUserDto, UpdateUserDto } from "./users.schema.js";
import { ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { SafeUser } from "./users.types.js";

export class UsersService {
  async getAllUsers(): Promise<SafeUser[]> {
    return usersRepository.findAll();
  }

  async getUserById(id: string): Promise<SafeUser> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return usersRepository.toSafeUser(user);
  }

  async createUser(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const emailConflict = await usersRepository.findByEmail(dto.email);
      if (emailConflict) {
        throw new ConflictError("Email is already taken by another account");
      }
    }

    const updated = await usersRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
    await usersRepository.delete(id);
  }
}

export const usersService = new UsersService();
