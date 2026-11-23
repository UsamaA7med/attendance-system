import { prisma } from "../../core/database/prisma.js";
import { RefreshTokenRecord } from "./auth.types.js";

export class RefreshTokenRepository {
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<RefreshTokenRecord> {
    const record = await prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
    return record;
  }

  async findByToken(token: string): Promise<RefreshTokenRecord | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.update({
        where: { token },
        data: { revokedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  async isTokenValid(token: string): Promise<{
    valid: boolean;
    record: RefreshTokenRecord | null;
    reason?: string;
  }> {
    const record = await this.findByToken(token);
    if (!record) {
      return { valid: false, record: null, reason: "Token not found" };
    }
    if (record.revokedAt) {
      return { valid: false, record, reason: "Token has been revoked" };
    }
    if (new Date() > record.expiresAt) {
      return { valid: false, record, reason: "Token has expired" };
    }
    return { valid: true, record };
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
