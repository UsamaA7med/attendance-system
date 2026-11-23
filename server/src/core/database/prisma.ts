import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../config/env.js";

const connectionString = process.env.DATABASE_URL || env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
