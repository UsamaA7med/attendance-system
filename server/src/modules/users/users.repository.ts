import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { User, CreateUserData, SafeUser, UserRole } from "./users.types.js";

function toPrismaRole(role?: string): Role {
  if (!role) return Role.STAFF;
  const upper = role.toUpperCase();
  if (upper === "ADMIN") return Role.ADMIN;
  if (upper === "TEACHER") return Role.TEACHER;
  return Role.STAFF;
}

function fromPrismaRole(role: Role): UserRole {
  return role.toLowerCase() as UserRole;
}

function toDomainUser(prismaUser: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: Role;
  createdAt: Date;
}): User {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    passwordHash: prismaUser.passwordHash,
    phone: prismaUser.phone,
    role: fromPrismaRole(prismaUser.role),
    createdAt: prismaUser.createdAt.toISOString(),
  };
}

class UsersRepository {
  constructor() {
    this.ensureDefaultUsers();
  }

  private async ensureDefaultUsers(): Promise<void> {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: "osama@attendance.local" },
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash("password123", 10);
        await prisma.user.createMany({
          data: [
            {
              name: "Osama Admin",
              email: "osama@attendance.local",
              passwordHash,
              role: Role.ADMIN,
              phone: "+201000000001",
              isActive: true,
            },
            {
              name: "Sarah Jenkins",
              email: "sarah@attendance.local",
              passwordHash,
              role: Role.STAFF,
              phone: "+201000000002",
              isActive: true,
            },
            {
              name: "Alex Rivera",
              email: "alex@attendance.local",
              passwordHash,
              role: Role.STAFF,
              phone: "+201000000003",
              isActive: true,
            },
          ],
          skipDuplicates: true,
        });
      }
    } catch (_err) {
      // In dev/test scenarios where database might connect lazily
    }
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => this.toSafeUser(toDomainUser(u)));
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? toDomainUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? toDomainUser(user) : null;
  }

  async create(data: CreateUserData): Promise<SafeUser> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        phone: data.phone,
        role: toPrismaRole(data.role),
        isActive: true,
      },
    });
    return this.toSafeUser(toDomainUser(user));
  }

  async update(
    id: string,
    updates: Partial<Omit<User, "id" | "passwordHash">>
  ): Promise<SafeUser | null> {
    try {
      const updateData: {
        name?: string;
        email?: string;
        phone?: string | null;
        role?: Role;
      } = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email.toLowerCase();
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.role !== undefined) updateData.role = toPrismaRole(updates.role);

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return this.toSafeUser(toDomainUser(user));
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  toSafeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const usersRepository = new UsersRepository();
